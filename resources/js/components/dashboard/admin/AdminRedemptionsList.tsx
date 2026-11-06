import React, { useState } from 'react';
import {
    CheckCircle2,
    Clock,
    Gift,
    KeyRound,
    Sparkles,
    User,
    XCircle,
} from 'lucide-react';
import { REWARD_TAG_LABELS, RewardTag } from '@/enums/dashboard';
import type {
    RedemptionStatus,
    RewardRedemptionRequest,
} from '@/services/redemptionService';
import { formatDateShort } from '@/utils/formatters';

interface AdminRedemptionsListProps {
    redemptions: RewardRedemptionRequest[];
    filteredRedemptions: RewardRedemptionRequest[];
    searchQuery: string;
    onClearSearch: () => void;
    onValidateRedemption: (id: number, status: 'completed' | 'cancelled') => void | Promise<void>;
}

export const AdminRedemptionsList: React.FC<AdminRedemptionsListProps> = ({
    redemptions,
    filteredRedemptions,
    searchQuery,
    onClearSearch,
    onValidateRedemption,
}) => {
    const [statusFilter, setStatusFilter] = useState<'all' | RedemptionStatus>('all');
    const [justUpdatedId, setJustUpdatedId] = useState<number | null>(null);

    const visibleItems = filteredRedemptions.filter((item) =>
        statusFilter === 'all' ? true : item.status === statusFilter
    );

    const pendingCount = redemptions.filter((r) => r.status === 'pending').length;
    const completedCount = redemptions.filter((r) => r.status === 'completed').length;
    const cancelledCount = redemptions.filter((r) => r.status === 'cancelled').length;

    const handleAction = async (id: number, status: 'completed' | 'cancelled') => {
        setJustUpdatedId(id);
        await onValidateRedemption(id, status);
        window.setTimeout(() => {
            setJustUpdatedId((prev) => (prev === id ? null : prev));
        }, 1200);
    };

    if (redemptions.length === 0) {
        return (
            <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Gift className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-bold text-app-navy dark:text-white">
                    Nenhuma solicitação de resgate registrada
                </p>
                <p className="text-xs text-app-graytext dark:text-slate-400 mt-1">
                    Os pedidos feitos pelos estudantes na loja aparecerão aqui para validação.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3.5">
            {/* Subtle filter bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-[#111827] p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            statusFilter === 'all'
                                ? 'bg-white dark:bg-[#182234] text-app-navy dark:text-white shadow-xs'
                                : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                        }`}
                    >
                        Todos ({redemptions.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('pending')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                            statusFilter === 'pending'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                                : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Aguardando ({pendingCount})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('completed')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            statusFilter === 'completed'
                                ? 'bg-[#4bb9a6]/15 text-[#4bb9a6] border border-[#4bb9a6]/30'
                                : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                        }`}
                    >
                        Validados ({completedCount})
                    </button>
                    {cancelledCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setStatusFilter('cancelled')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                statusFilter === 'cancelled'
                                    ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                                    : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white'
                            }`}
                        >
                            Cancelados ({cancelledCount})
                        </button>
                    )}
                </div>

                <span className="text-[11px] text-app-graytext dark:text-slate-400">
                    Confira o protocolo apresentado pelo estudante antes de confirmar a entrega
                </span>
            </div>

            {visibleItems.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs font-bold text-app-navy dark:text-white">
                        Nenhum pedido encontrado para o filtro selecionado
                    </p>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={onClearSearch}
                            className="mt-2 text-xs font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                        >
                            Limpar pesquisa
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-2.5">
                    {visibleItems.map((item) => {
                        const isPending = item.status === 'pending';
                        const isCompleted = item.status === 'completed';
                        const isHighlighted = justUpdatedId === item.id;
                        const rewardName = item.reward?.name || 'Recompensa';
                        const rewardTag = item.reward?.tag || 'other';
                        const userName = item.user?.name || 'Estudante';
                        const userNick = item.user?.nick;

                        return (
                            <div
                                key={item.id}
                                className={`rounded-xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                    isPending
                                        ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06] border-amber-500/30 dark:border-amber-500/25'
                                        : isHighlighted
                                          ? 'bg-[#4bb9a6]/10 border-[#4bb9a6]/40'
                                          : 'bg-slate-50/70 dark:bg-[#111827]/70 border-slate-200/80 dark:border-slate-800/80'
                                }`}
                            >
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                            isPending
                                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                                                : isCompleted
                                                  ? 'bg-[#4bb9a6]/15 border-[#4bb9a6]/30 text-[#4bb9a6]'
                                                  : 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                                        }`}
                                    >
                                        {isPending ? (
                                            <Clock className="w-4 h-4" />
                                        ) : isCompleted ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <XCircle className="w-4 h-4" />
                                        )}
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-extrabold bg-slate-200/80 dark:bg-slate-800 text-app-navy dark:text-white border border-slate-300/70 dark:border-slate-700">
                                                <KeyRound className="w-3 h-3 text-[#4bb9a6]" />
                                                {item.voucher_code}
                                            </span>

                                            <span className="text-xs sm:text-sm font-extrabold text-app-navy dark:text-white truncate">
                                                {rewardName}
                                            </span>

                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#4bb9a6]/15 text-[#4bb9a6] border border-[#4bb9a6]/25">
                                                {REWARD_TAG_LABELS[rewardTag as RewardTag] || rewardTag}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-app-graytext dark:text-slate-400">
                                            <span className="inline-flex items-center gap-1 font-semibold text-app-navy/90 dark:text-slate-200">
                                                <User className="w-3 h-3 text-slate-400" />
                                                {userName}
                                                {userNick && (
                                                    <span className="text-[#4bb9a6] font-bold">
                                                        @{userNick}
                                                    </span>
                                                )}
                                            </span>
                                            <span>•</span>
                                            <span className="inline-flex items-center gap-1 font-bold text-[#ea7349]">
                                                <Sparkles className="w-3 h-3" />
                                                {item.points_cost.toLocaleString('pt-BR')} PTS
                                            </span>
                                            <span>•</span>
                                            <span>Solicitado em {formatDateShort(item.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800/60">
                                    {isPending ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`Tem certeza que deseja cancelar o pedido ${item.voucher_code}? Os pontos serão estornados para o estudante.`)) {
                                                        handleAction(item.id, 'cancelled');
                                                    }
                                                }}
                                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/25 transition-colors cursor-pointer"
                                            >
                                                Cancelar e Estornar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAction(item.id, 'completed')}
                                                className="px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold bg-[#4bb9a6] hover:bg-[#3da392] text-white shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Confirmar Entrega</span>
                                            </button>
                                        </>
                                    ) : (
                                        <span
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 border ${
                                                isCompleted
                                                    ? 'bg-[#4bb9a6]/15 text-[#4bb9a6] border-[#4bb9a6]/30'
                                                    : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <>
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Entrega Validada</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span>Cancelado / Estornado</span>
                                                </>
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
