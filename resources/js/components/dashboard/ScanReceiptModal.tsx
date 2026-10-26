import React, { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
    Camera,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    SwitchCamera,
} from 'lucide-react';
import ModalDialog from '@/components/ui/ModalDialog';
import { apiRequest } from '@/lib/api';
import type { TaxReceiptItem } from '@/types/dashboard';

interface ScanReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (receipt: TaxReceiptItem) => void;
}

export const ScanReceiptModal: React.FC<ScanReceiptModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const isProcessingRef = useRef<boolean>(false);

    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const stopCamera = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsCameraActive(false);
    }, []);

    const submitScannedQrCode = useCallback(
        async (rawQrContent: string) => {
            if (isProcessingRef.current) {
                return;
            }
            isProcessingRef.current = true;
            stopCamera();

            setErrorMessage(null);
            setSuccessMessage(null);
            setIsSubmitting(true);

            const trimmed = rawQrContent.trim();
            const digitsOnly = trimmed.replace(/\D/g, '');
            const finalUrl =
                /^35\d{42}$/.test(digitsOnly) && !trimmed.startsWith('http')
                    ? `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${digitsOnly}|2|1|1`
                    : trimmed;

            try {
                const createdReceipt = await apiRequest<TaxReceiptItem>('/api/tax-receipts', {
                    method: 'POST',
                    body: JSON.stringify({
                        url: finalUrl,
                    }),
                });

                setSuccessMessage(
                    'QR Code lido com sucesso! Cupom enviado para validação assíncrona na SEFAZ-SP.'
                );
                onSuccess(createdReceipt);
            } catch (error: any) {
                setErrorMessage(
                    error.message || 'O QR Code lido não corresponde a uma nota fiscal paulista válida.'
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [onSuccess, stopCamera]
    );

    const startCamera = useCallback(async () => {
        stopCamera();
        setCameraError(null);
        setErrorMessage(null);
        setSuccessMessage(null);
        isProcessingRef.current = false;

        if (
            typeof navigator === 'undefined' ||
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            setCameraError(
                'Seu navegador não suporta acesso à câmera ou requer conexão segura (HTTPS / localhost).'
            );
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: facingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;

            const video = videoRef.current;
            if (!video) {
                stopCamera();
                return;
            }

            video.srcObject = stream;
            await video.play();
            setIsCameraActive(true);

            const NativeBarcodeDetector = (window as any).BarcodeDetector;
            const detector = NativeBarcodeDetector
                ? new NativeBarcodeDetector({ formats: ['qr_code'] })
                : null;

            const scanFrame = async () => {
                if (isProcessingRef.current || !videoRef.current || !streamRef.current) {
                    return;
                }

                const currentVideo = videoRef.current;
                if (currentVideo.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
                    // 1. Try native BarcodeDetector first if available
                    if (detector) {
                        try {
                            const barcodes = await detector.detect(currentVideo);
                            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                                submitScannedQrCode(barcodes[0].rawValue);
                                return;
                            }
                        } catch {
                            // Fall through to jsQR canvas decoder
                        }
                    }

                    // 2. Universal Canvas + jsQR fallback
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const width = currentVideo.videoWidth;
                        const height = currentVideo.videoHeight;

                        if (width > 0 && height > 0) {
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d', { willReadFrequently: true });

                            if (ctx) {
                                ctx.drawImage(currentVideo, 0, 0, width, height);
                                const imageData = ctx.getImageData(0, 0, width, height);
                                const qrCode = jsQR(
                                    imageData.data,
                                    imageData.width,
                                    imageData.height,
                                    { inversionAttempts: 'dontInvert' }
                                );

                                if (qrCode && qrCode.data) {
                                    submitScannedQrCode(qrCode.data);
                                    return;
                                }
                            }
                        }
                    }
                }

                rafRef.current = requestAnimationFrame(scanFrame);
            };

            rafRef.current = requestAnimationFrame(scanFrame);
        } catch {
            setCameraError(
                'Não foi possível acessar a câmera. Verifique se você concedeu permissão de câmera no navegador.'
            );
        }
    }, [facingMode, stopCamera, submitScannedQrCode]);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isOpen, startCamera, stopCamera]);

    const handleToggleCamera = () => {
        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    };

    const handleClose = () => {
        stopCamera();
        setErrorMessage(null);
        setSuccessMessage(null);
        setCameraError(null);
        onClose();
    };

    return (
        <ModalDialog
            isOpen={isOpen}
            onClose={handleClose}
            title="Escanear Cupom Fiscal"
            subtitle="Aponte a câmera para o QR Code da Nota Fiscal Paulista (NFC-e) para doar automaticamente."
        >
            <div className="space-y-4">
                {cameraError && (
                    <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl p-4 text-xs flex flex-col gap-3">
                        <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>{cameraError}</span>
                        </div>
                        <button
                            type="button"
                            onClick={startCamera}
                            className="self-start bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Tentar novamente</span>
                        </button>
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl p-4 text-xs flex flex-col gap-3">
                        <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={startCamera}
                            className="self-start bg-[#4bb9a6] hover:bg-[#3da392] text-white font-extrabold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Escanear novamente</span>
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl p-4 text-xs flex flex-col gap-3">
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={startCamera}
                            className="self-start bg-[#4bb9a6] hover:bg-[#3da392] text-white font-extrabold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Escanear outro cupom</span>
                        </button>
                    </div>
                )}

                {/* Live Camera Viewport */}
                {!successMessage && !errorMessage && !cameraError && (
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-4/3 flex items-center justify-center">
                        <video
                            ref={videoRef}
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Reticle / Viewfinder Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                            <div className="w-52 h-52 sm:w-60 sm:h-60 relative rounded-2xl border-2 border-[#4bb9a6]/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]">
                                <span className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-[#4bb9a6] rounded-tl-lg" />
                                <span className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-[#4bb9a6] rounded-tr-lg" />
                                <span className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-[#4bb9a6] rounded-bl-lg" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-[#4bb9a6] rounded-br-lg" />
                            </div>

                            <span className="mt-4 bg-slate-950/85 text-slate-200 text-[11px] font-bold px-3 py-1 rounded-full border border-slate-700/80">
                                {isSubmitting
                                    ? 'Validando QR Code...'
                                    : isCameraActive
                                      ? 'Posicione o QR Code da nota no quadro'
                                      : 'Iniciando câmera...'}
                            </span>
                        </div>

                        {isSubmitting && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-[#4bb9a6]" />
                                <span className="text-xs font-extrabold text-white">
                                    Enviando cupom fiscal...
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                        type="button"
                        onClick={handleToggleCamera}
                        disabled={!isCameraActive || isSubmitting}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-app-navy dark:text-slate-300 hover:text-app-teal dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <SwitchCamera className="w-4 h-4 text-[#4bb9a6]" />
                        <span>Alternar Câmera</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-app-graytext dark:text-slate-300 hover:text-app-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </ModalDialog>
    );
};

export default ScanReceiptModal;
