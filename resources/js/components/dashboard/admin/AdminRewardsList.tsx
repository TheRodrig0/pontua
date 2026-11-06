import React from 'react';
import { Gift, Loader2, Pencil, Search, Trash2 } from 'lucide-react';
import { REWARD_TAG_LABELS, RewardTag } from '@/enums/dashboard';
import type { RewardItem } from '@/types/dashboard';

interface AdminRewardsListProps {
    rewards: RewardItem[];
    filteredRewards: RewardItem[];
    searchQuery: string;
    deletingId: number | null;
    onClearSearch: () => void;
    onEditReward: (reward: RewardItem) => void;
    onDeleteReward: (rewardId: number) => void;
}

export const AdminRewardsList: React.FC<AdminRewardsListProps> = ({
    rewards,
    filteredRewards,
    searchQuery,
    deletingId,
    onClearSearch,
    onEditReward,
    onDeleteReward,
}) => {
    const isRewardsEmpty = rewards.length === 0;
    const isFilteredEmpty = filteredRewards.length === 0;

    if (isRewardsEmpty) {
        return (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Gift className="w-9 h-9 text-slate-400 dark:text-slate-500 mx-auto mb-2.5" />
                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                    Nenhum prêmio cadastrado
                </p>
            </div>
        );
    }

    if (isFilteredEmpty) {
        return (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Search className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                    Nenhum prêmio encontrado
                </p>
                <p className="text-xs text-app-graytext dark:text-slate-400 mt-1">
                    Nenhum item corresponde a &quot;{searchQuery}&quot;.
                </p>
                <button
                    type="button"
                    onClick={onClearSearch}
                    className="mt-3 text-xs font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                >
                    Limpar busca
                </button>
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
            {filteredRewards.map((reward) => {
                const tagLabel = REWARD_TAG_LABELS[reward.tag as RewardTag] || reward.tag;
                const isDeletingThis = deletingId === reward.id;

                return (
                    <div
                        key={reward.id}
                        className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-app-graytext dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                <Gift className="w-4 h-4" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-extrabold text-app-navy dark:text-white">
                                        {reward.name}
                                    </span>
                                    <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {tagLabel}
                                    </span>
                                </div>
                                {reward.description && (
                                    <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-0.5">
                                        {reward.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                            <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap tabular-nums">
                                {reward.cost.toLocaleString('pt-BR')} pts
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onEditReward(reward)}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-app-graytext dark:text-slate-300 hover:text-app-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Editar prêmio"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteReward(reward.id)}
                                    disabled={isDeletingThis}
                                    className="p-2 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                    title="Excluir prêmio"
                                >
                                    {isDeletingThis ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
