import React, { useCallback, useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import jsQR from 'jsqr';
import {
    ScanLine,
    Camera,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    SwitchCamera,
    ImageUp,
    Keyboard,
    Send,
    ZoomIn,
} from 'lucide-react';
import ModalDialog from '@/components/ui/ModalDialog';
import { taxReceiptService } from '@/services/taxReceiptService';
import type { TaxReceiptItem } from '@/types/dashboard';

// Force qr-scanner to use its WebWorker decoder instead of Chrome's broken desktop BarcodeDetector stub on Windows/Linux
(QrScanner as any)._disableBarcodeDetector = true;

interface ScanReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (receipt: TaxReceiptItem) => void;
}

type ScanInputMode = 'usb' | 'camera' | 'manual';

export const ScanReceiptModal: React.FC<ScanReceiptModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanLoopRef = useRef<number | null>(null);
    const qrEngineRef = useRef<Worker | any>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const isProcessingRef = useRef<boolean>(false);

    const [inputMode, setInputMode] = useState<ScanInputMode>('usb');
    const [manualInput, setManualInput] = useState('');
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [zoomLevel, setZoomLevel] = useState<1 | 1.8 | 2.5>(1.8);
    const [videoResolution, setVideoResolution] = useState<string>('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isStartingCamera, setIsStartingCamera] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const stopCamera = useCallback(() => {
        if (scanLoopRef.current !== null) {
            window.clearTimeout(scanLoopRef.current);
            scanLoopRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsCameraActive(false);
        setVideoResolution('');
    }, []);

    const submitScannedQrCode = useCallback(
        async (rawQrContent: string) => {
            const trimmed = rawQrContent.trim();
            if (!trimmed || isProcessingRef.current) {
                return;
            }

            isProcessingRef.current = true;
            stopCamera();

            setErrorMessage(null);
            setSuccessMessage(null);
            setIsSubmitting(true);

            try {
                const createdReceipt = await taxReceiptService.store(trimmed);

                setSuccessMessage(
                    'QR Code lido com sucesso! Cupom enviado para validação na SEFAZ-SP.'
                );
                setManualInput('');
                onSuccess(createdReceipt);
            } catch (error: any) {
                setErrorMessage(
                    error.message ||
                        'O QR Code lido não corresponde a uma Nota Fiscal Paulista válida.'
                );
            } finally {
                setIsSubmitting(false);
                isProcessingRef.current = false;
            }
        },
        [onSuccess, stopCamera]
    );

    const startCamera = useCallback(
        async (overrideFacingMode?: 'environment' | 'user') => {
            stopCamera();
            setCameraError(null);
            setErrorMessage(null);
            setSuccessMessage(null);
            setIsStartingCamera(true);
            isProcessingRef.current = false;

            const targetFacing = overrideFacingMode || facingMode;

            try {
                // Explicitly request 1080p (1920x1080) so WebRTC does not default to 640x480 VGA
                let stream: MediaStream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: { ideal: targetFacing },
                            width: { ideal: 1920, min: 1280 },
                            height: { ideal: 1080, min: 720 },
                            ...({ focusMode: { ideal: 'continuous' } } as any),
                        },
                        audio: false,
                    });
                } catch {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: { ideal: targetFacing },
                            width: { ideal: 1920 },
                            height: { ideal: 1080 },
                        },
                        audio: false,
                    });
                }

                streamRef.current = stream;

                const video = videoRef.current;
                if (!video) {
                    stopCamera();
                    setIsStartingCamera(false);
                    return;
                }

                video.srcObject = stream;
                await video.play();

                const vw = video.videoWidth || 1920;
                const vh = video.videoHeight || 1080;
                setVideoResolution(`${vw}×${vh}`);
                setIsCameraActive(true);
                setIsStartingCamera(false);

                if (!qrEngineRef.current) {
                    try {
                        qrEngineRef.current = await QrScanner.createQrEngine();
                    } catch {
                        qrEngineRef.current = null;
                    }
                }

                const workCanvas = document.createElement('canvas');
                const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });

                let passCounter = 0;

                const scanTick = async () => {
                    if (
                        isProcessingRef.current ||
                        !videoRef.current ||
                        !streamRef.current ||
                        !workCtx
                    ) {
                        return;
                    }

                    const currentVideo = videoRef.current;
                    if (currentVideo.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
                        const width = currentVideo.videoWidth;
                        const height = currentVideo.videoHeight;

                        if (width > 0 && height > 0) {
                            const minDim = Math.min(width, height);

                            // Alternate between tight center macro crop (for dense receipts held at 20-35cm on 1080p webcams)
                            // and wider crop, preserving 1:1 native 1080p pixels without downscaling to 400x400.
                            const cropRatio = passCounter % 2 === 0 ? 0.52 : 0.82;
                            const useThermalContrast = passCounter % 3 === 1;
                            passCounter++;

                            const cropSize = Math.round(minDim * cropRatio);
                            const sx = Math.round((width - cropSize) / 2);
                            const sy = Math.round((height - cropSize) / 2);

                            // Keep target canvas between 600px and 900px so dense Version-12 NFC-e modules stay sharp
                            const targetSize = Math.min(900, Math.max(640, cropSize));
                            workCanvas.width = targetSize;
                            workCanvas.height = targetSize;

                            workCtx.filter = useThermalContrast
                                ? 'grayscale(100%) contrast(190%) brightness(105%)'
                                : 'none';

                            workCtx.drawImage(
                                currentVideo,
                                sx,
                                sy,
                                cropSize,
                                cropSize,
                                0,
                                0,
                                targetSize,
                                targetSize
                            );

                            // 1. Decode via Nimiq QrScanner WebWorker on the high-res 1:1 crop
                            try {
                                const res = await QrScanner.scanImage(workCanvas, {
                                    returnDetailedScanResult: true,
                                    qrEngine: qrEngineRef.current,
                                    disallowCanvasResizing: true,
                                });
                                if (res?.data) {
                                    await submitScannedQrCode(res.data);
                                    return;
                                }
                            } catch {
                                // Continue to jsQR fallback
                            }

                            // 2. Decode via jsQR with attemptBoth on the same high-res crop
                            try {
                                const imageData = workCtx.getImageData(
                                    0,
                                    0,
                                    targetSize,
                                    targetSize
                                );
                                const qr = jsQR(
                                    imageData.data,
                                    imageData.width,
                                    imageData.height,
                                    { inversionAttempts: 'attemptBoth' }
                                );
                                if (qr && qr.data) {
                                    await submitScannedQrCode(qr.data);
                                    return;
                                }
                            } catch {
                                // Ignore frame decode error
                            }
                        }
                    }

                    if (!isProcessingRef.current && streamRef.current) {
                        scanLoopRef.current = window.setTimeout(scanTick, 110);
                    }
                };

                scanLoopRef.current = window.setTimeout(scanTick, 100);
            } catch {
                stopCamera();
                setIsStartingCamera(false);
                setCameraError(
                    'Não foi possível acessar a câmera neste navegador. Você pode enviar uma foto do QR Code abaixo ou usar a aba "Chave ou Link".'
                );
            }
        },
        [facingMode, stopCamera, submitScannedQrCode]
    );

    useEffect(() => {
        if (!isOpen || inputMode !== 'camera') {
            stopCamera();
            return;
        }

        const timer = window.setTimeout(() => {
            void startCamera();
        }, 80);

        return () => {
            window.clearTimeout(timer);
            stopCamera();
        };
    }, [isOpen, inputMode, startCamera, stopCamera]);

    const handleSwitchCamera = async () => {
        const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(nextFacing);
        await startCamera(nextFacing);
    };

    const handleCycleZoom = () => {
        setZoomLevel((prev) => (prev === 1 ? 1.8 : prev === 1.8 ? 2.5 : 1));
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) {
            return;
        }

        stopCamera();
        setErrorMessage(null);
        setSuccessMessage(null);
        setCameraError(null);
        setIsSubmitting(true);

        try {
            // Try Nimiq QrScanner with alsoTryWithoutScanRegion enabled
            try {
                const result = await QrScanner.scanImage(file, {
                    returnDetailedScanResult: true,
                    alsoTryWithoutScanRegion: true,
                });
                if (result?.data) {
                    setIsSubmitting(false);
                    await submitScannedQrCode(result.data);
                    return;
                }
            } catch {
                // Fallback to high-contrast jsQR below
            }

            const bitmap = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            if (ctx) {
                for (const filter of [
                    'none',
                    'grayscale(100%) contrast(200%)',
                ]) {
                    ctx.filter = filter;
                    ctx.drawImage(bitmap, 0, 0);
                    const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
                    const qr = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'attemptBoth',
                    });
                    if (qr && qr.data) {
                        setIsSubmitting(false);
                        await submitScannedQrCode(qr.data);
                        return;
                    }
                }
            }

            setIsSubmitting(false);
            setErrorMessage(
                'Nenhum QR Code foi identificado na imagem enviada. Tente aproximar a foto do QR Code ou use a aba "Chave ou Link".'
            );
        } catch {
            setIsSubmitting(false);
            setErrorMessage('Não foi possível processar a imagem selecionada.');
        }
    };

    const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = manualInput.trim();
        if (!trimmed) {
            setErrorMessage('Informe a URL da SEFAZ-SP ou os 44 dígitos da Chave de Acesso.');
            return;
        }
        await submitScannedQrCode(trimmed);
    };

    // Global USB Scanner Listener (Ativo estritamente quando isOpen === true)
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let buffer = '';
        let lastKeyTime = 0;
        let submitTimer: any = null;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Se o usuário estiver digitando manualmente num input/textarea, não interferir
            const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (targetTag === 'input' || targetTag === 'textarea') {
                return;
            }

            const now = Date.now();
            const timeDiff = now - lastKeyTime;
            lastKeyTime = now;

            // Se o tempo entre teclas for maior que 80ms, é digitação humana -> reseta buffer
            if (timeDiff > 80 && buffer.length > 0) {
                buffer = '';
            }

            // Ignorar modificadores
            if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') {
                return;
            }

            if (e.key.length === 1) {
                buffer += e.key;

                if (submitTimer) {
                    clearTimeout(submitTimer);
                }

                // Dispara envio sem precisar da tecla Enter
                submitTimer = setTimeout(() => {
                    const clean = buffer.trim();
                    const isNfeUrl = clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('https>');
                    const is44DigitsKey = /^35\d{42}$/.test(clean.replace(/\D/g, ''));

                    if ((isNfeUrl || is44DigitsKey) && clean.length >= 20) {
                        void submitScannedQrCode(clean);
                        buffer = '';
                    }
                }, 75);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (submitTimer) {
                clearTimeout(submitTimer);
            }
        };
    }, [isOpen, submitScannedQrCode]);

    const handleClose = () => {
        stopCamera();
        setErrorMessage(null);
        setSuccessMessage(null);
        setCameraError(null);
        setInputMode('usb');
        onClose();
    };

    const isShowingBanner = Boolean(successMessage || errorMessage || cameraError);

    return (
        <ModalDialog
            isOpen={isOpen}
            onClose={handleClose}
            title="Escanear Cupom Fiscal"
            subtitle="Centralize o QR Code da Nota Fiscal Paulista no quadro, envie uma foto ou informe a chave de 44 dígitos."
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => {
                            setErrorMessage(null);
                            setSuccessMessage(null);
                            setInputMode('camera');
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            inputMode === 'camera'
                                ? 'bg-[#4bb9a6] text-white shadow-xs'
                                : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                        }`}
                    >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Câmera 1080p / Foto</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            stopCamera();
                            setCameraError(null);
                            setErrorMessage(null);
                            setSuccessMessage(null);
                            setInputMode('manual');
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            inputMode === 'manual'
                                ? 'bg-[#4bb9a6] text-white shadow-xs'
                                : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                        }`}
                    >
                        <Keyboard className="w-3.5 h-3.5" />
                        <span>Chave ou Link</span>
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />

                {cameraError && inputMode === 'camera' && (
                    <div className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl p-4 text-xs flex flex-col gap-3">
                        <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                            <span>{cameraError}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => void startCamera()}
                                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 font-bold px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Tentar câmera novamente</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-[#4bb9a6] hover:bg-[#3da392] text-white font-bold px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <ImageUp className="w-3.5 h-3.5" />
                                <span>Enviar Foto do QR Code</span>
                            </button>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl p-4 text-xs flex flex-col gap-3">
                        <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                        {inputMode === 'camera' && (
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => void startCamera()}
                                    className="bg-[#4bb9a6] hover:bg-[#3da392] text-white font-extrabold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                    <span>Escanear novamente</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-slate-200 dark:bg-slate-800 text-app-navy dark:text-slate-200 font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <ImageUp className="w-3.5 h-3.5 text-[#4bb9a6]" />
                                    <span>Enviar outra foto</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl p-4 text-xs flex flex-col gap-3">
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </div>
                        {inputMode === 'camera' && (
                            <button
                                type="button"
                                onClick={() => void startCamera()}
                                className="self-start bg-[#4bb9a6] hover:bg-[#3da392] text-white font-extrabold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Escanear outro cupom</span>
                            </button>
                        )}
                    </div>
                )}

                <div
                    className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-4/3 ${
                        inputMode !== 'camera' || isShowingBanner ? 'hidden' : 'block'
                    }`}
                >
                    <video
                        ref={videoRef}
                        playsInline
                        muted
                        className={`w-full h-full object-cover transition-transform duration-200 ${
                            zoomLevel === 2.5
                                ? 'scale-250'
                                : zoomLevel === 1.8
                                  ? 'scale-175'
                                  : 'scale-100'
                        }`}
                    />

                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                        <div className="w-56 h-56 sm:w-64 sm:h-64 relative rounded-2xl border-2 border-[#4bb9a6]/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.50)]">
                            <span className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-[#4bb9a6] rounded-tl-lg" />
                            <span className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-[#4bb9a6] rounded-tr-lg" />
                            <span className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-[#4bb9a6] rounded-bl-lg" />
                            <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-[#4bb9a6] rounded-br-lg" />
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                            <span className="bg-slate-950/90 text-slate-200 text-[11px] font-bold px-3 py-1 rounded-full border border-slate-700/80">
                                {isCameraActive
                                    ? 'Centralize o QR Code no quadrado'
                                    : 'Iniciando câmera 1080p...'}
                            </span>
                            {videoResolution && (
                                <span className="bg-[#4bb9a6]/20 text-[#4bb9a6] text-[10px] font-extrabold px-2 py-1 rounded-full border border-[#4bb9a6]/40">
                                    {videoResolution} • {zoomLevel}x
                                </span>
                            )}
                        </div>
                    </div>

                    {(isStartingCamera || isSubmitting) && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
                            <Loader2 className="w-8 h-8 animate-spin text-[#4bb9a6]" />
                            <span className="text-xs font-extrabold text-white">
                                {isSubmitting
                                    ? 'Enviando cupom fiscal...'
                                    : 'Iniciando câmera em alta definição...'}
                            </span>
                        </div>
                    )}
                </div>

                {inputMode === 'manual' && (
                    <form onSubmit={handleManualSubmit} className="space-y-3">
                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5">
                            <label
                                htmlFor="manual-nfce-input"
                                className="block text-[10px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400 mb-1.5"
                            >
                                Chave de Acesso (44 dígitos SP) ou URL da Nota Fiscal
                            </label>
                            <input
                                id="manual-nfce-input"
                                type="text"
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                placeholder="Ex: 352611... (44 dígitos) ou https://www.nfce.fazenda.sp.gov.br/..."
                                className="w-full bg-transparent text-xs sm:text-sm font-mono text-app-navy dark:text-white placeholder:text-slate-400 focus:outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#4bb9a6] hover:bg-[#3da392] disabled:opacity-60 text-white text-xs font-extrabold uppercase tracking-wider py-3 rounded-xl inline-flex items-center justify-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>{isSubmitting ? 'Enviando...' : 'Enviar Nota Fiscal'}</span>
                        </button>
                    </form>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {inputMode === 'camera' ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCycleZoom}
                                disabled={!isCameraActive || isSubmitting}
                                className="px-3 py-2.5 rounded-xl text-xs font-bold text-app-navy dark:text-slate-300 hover:text-app-teal dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <ZoomIn className="w-4 h-4 text-[#4bb9a6]" />
                                <span>Zoom {zoomLevel}x</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleSwitchCamera()}
                                disabled={!isCameraActive || isSubmitting}
                                className="px-3 py-2.5 rounded-xl text-xs font-bold text-app-navy dark:text-slate-300 hover:text-app-teal dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <SwitchCamera className="w-4 h-4 text-[#4bb9a6]" />
                                <span>Alternar Câmera</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSubmitting}
                                className="px-3 py-2.5 rounded-xl text-xs font-bold text-app-navy dark:text-slate-300 hover:text-app-teal dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <ImageUp className="w-4 h-4 text-[#4bb9a6]" />
                                <span>Ler Foto</span>
                            </button>
                        </div>
                    ) : (
                        <div />
                    )}

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
