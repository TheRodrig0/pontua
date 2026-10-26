import React, { useEffect, useState } from 'react';
import {
    Sparkles,
    Loader2,
    AlertCircle,
    Shirt,
    Watch,
    Gift,
} from 'lucide-react';
import ModalDialog from '@/components/ui/ModalDialog';
import { apiRequest } from '@/lib/api';
import type { RewardItem, RewardTagValue } from '@/types/dashboard';

interface RewardDetailModalProps {
    rewardId: number | null;
    currentBalance: number;
    onClose: () => void;
}

const TAG_LABELS: Record<RewardTagValue, string> = {
    clothing: 'Vestuário',
    accessory: 'Acessório',
    cosmetic: 'Cosmético',
    other: 'Outros',
};

export const RewardDetailModal: React.FC<RewardDetailModalProps> = ({
    rewardId,
    currentBalance,
    onClose,
}) => {
    const [reward, setReward] = useState<RewardItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!rewardId) {
            setReward(null);
            setErrorMessage(null);
            setImageError(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setErrorMessage(null);
        setImageError(false);

        apiRequest<RewardItem>(`/api/rewards/${rewardId}`)
            .then((data) => {
                if (isMounted) {
                    setReward(data);
                }
            })
            .catch((error: any) => {
                if (isMounted) {
                    setErrorMessage(
                        error.message || 'Não foi possível carregar os detalhes da recompensa.'
                    );
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [rewardId]);

    const canAfford = reward ? currentBalance >= reward.cost : false;

    const renderFallbackIcon = (tag?: RewardTagValue) => {
        if (tag === 'clothing') return <Shirt className="w-10 h-10 text-white" />;
        if (tag === 'accessory') return <Watch className="w-10 h-10 text-white" />;
        if (tag === 'cosmetic') return <Sparkles className="w-10 h-10 text-white" />;
        return <Gift className="w-10 h-10 text-white" />;
    };

    return (
        <ModalDialog
            isOpen={rewardId !== null}
            onClose={onClose}
            title={reward ? reward.name : 'Detalhes da Recompensa'}
            subtitle="Informações da recompensa cadastrada no sistema."
        >
            {isLoading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-7 h-7 animate-spin text-[#4bb9a6]" />
                    <span className="text-xs font-medium">
                        Carregando informações da recompensa...
                    </span>
                </div>
            ) : errorMessage ? (
                <div
                    role="alert"
                    className="bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl p-4 text-xs flex items-start gap-2.5"
                >
                    <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                </div>
            ) : reward ? (
                <div className="space-y-4">
                    {reward.url_image && !imageError ? (
                        <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
                            <img
                                src={reward.url_image}
                                alt={reward.name}
                                onError={() => setImageError(true)}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-36 w-full rounded-xl bg-gradient-to-br from-[#134e4a] to-[#0f3d3e] flex items-center justify-center border border-white/10">
                            <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5">
                                {renderFallbackIcon(reward.tag)}
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                                {TAG_LABELS[reward.tag] || reward.tag}
                            </span>

                            <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/30 text-xs font-black px-3 py-1 rounded-lg inline-flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{reward.cost} PTS</span>
                            </span>
                        </div>

                        {reward.description && (
                            <p className="text-xs text-app-graytext dark:text-slate-300 leading-relaxed pt-1">
                                {reward.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-[#4bb9a6]/10 dark:bg-[#112a2e]/50 border border-[#4bb9a6]/25 dark:border-[#4bb9a6]/20 rounded-xl p-3.5 text-xs">
                        <span className="text-app-graytext dark:text-slate-300">
                            Seu saldo atual:{' '}
                            <strong className="text-app-navy dark:text-white">
                                {currentBalance.toLocaleString('pt-BR')} pts
                            </strong>
                        </span>
                        <span
                            className={`font-bold ${
                                canAfford ? 'text-[#4bb9a6]' : 'text-amber-600 dark:text-amber-400'
                            }`}
                        >
                            {canAfford
                                ? 'Saldo suficiente'
                                : `Faltam ${(reward.cost - currentBalance).toLocaleString('pt-BR')} pts`}
                        </span>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-app-graytext dark:text-slate-300 hover:text-app-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            ) : null}
        </ModalDialog>
    );
};

export default RewardDetailModal;
