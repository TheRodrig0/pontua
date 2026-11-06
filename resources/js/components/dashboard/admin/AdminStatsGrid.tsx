import React from 'react';
import { Gift, Plus, ReceiptText, Sparkles } from 'lucide-react';
import { formatCurrencyBRL } from '@/utils/formatters';
import type { AdminOverviewData } from '@/types/dashboard';

export type AdminSubTab = 'rewards' | 'redemptions' | 'receipts' | 'users';

interface AdminStatsGridProps {
    stats?: AdminOverviewData['stats'];
    rewardsCount: number;
    onSelectSubTab: (tab: AdminSubTab) => void;
    onOpenCreateRewardModal: () => void;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({
    stats,
    rewardsCount,
    onSelectSubTab,
    onOpenCreateRewardModal,
}) => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Notas Fiscais Recebidas
                        </span>
                        <ReceiptText className="w-4 h-4 text-[#4bb9a6]" />
                    </div>

                    <div className="my-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight tabular-nums">
                            {stats?.total_receipts ?? 0}
                        </span>
                        <span className="text-xs font-extrabold text-[#4bb9a6] uppercase tracking-wider">
                            NOTAS
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            {stats?.approved_receipts ?? 0} aprovadas ·{' '}
                            {formatCurrencyBRL(stats?.total_value_donated ?? 0)}
                        </span>
                        <button
                            type="button"
                            onClick={() => onSelectSubTab('receipts')}
                            className="text-[11px] font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                        >
                            Ver notas →
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Pontos Distribuídos
                        </span>
                        <Sparkles className="w-4 h-4 text-[#ea7349]" />
                    </div>

                    <div className="my-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight tabular-nums">
                            {(stats?.total_points_distributed ?? 0).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs font-extrabold text-[#ea7349] uppercase tracking-wider">
                            PTS
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            {stats?.total_users ?? 0} usuários cadastrados
                        </span>
                        <button
                            type="button"
                            onClick={() => onSelectSubTab('users')}
                            className="text-[11px] font-bold text-[#ea7349] hover:underline cursor-pointer"
                        >
                            Ver usuários →
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Catálogo de Prêmios
                        </span>
                        <Gift className="w-4 h-4 text-[#4bb9a6]" />
                    </div>

                    <div className="my-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight tabular-nums">
                            {stats?.total_rewards ?? rewardsCount}
                        </span>
                        <span className="text-xs font-extrabold text-[#4bb9a6] uppercase tracking-wider">
                            ITENS
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            Disponíveis na loja estudantil
                        </span>
                        <button
                            type="button"
                            onClick={onOpenCreateRewardModal}
                            className="text-[11px] font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                        >
                            Novo prêmio →
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#4bb9a6]/15 dark:bg-[#112a2e] border border-[#4bb9a6]/25 dark:border-[#4bb9a6]/20 text-[#4bb9a6] flex items-center justify-center shrink-0">
                        <Gift className="w-6 h-6" />
                    </div>

                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-app-navy dark:text-white tracking-tight">
                            Gerenciar Recompensas e Relatórios
                        </h2>
                        <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5 leading-relaxed">
                            Cadastre novos itens no catálogo da loja, acompanhe os cupons validados para a APAE e consulte os alunos participantes.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onOpenCreateRewardModal}
                    className="w-full sm:w-auto bg-[#4bb9a6] hover:bg-[#3da392] text-white text-xs font-extrabold uppercase tracking-wider px-5 py-3 rounded-xl inline-flex items-center justify-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>CADASTRAR PRÊMIO</span>
                </button>
            </div>
        </>
    );
};
