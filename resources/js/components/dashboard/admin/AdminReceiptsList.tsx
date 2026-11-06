import React from 'react';
import { AlertCircle, Check, Clock, ReceiptText, Search } from 'lucide-react';
import { formatAccessKeyPreview, formatCurrencyBRL } from '@/utils/formatters';
import type { TaxReceiptItem } from '@/types/dashboard';

interface AdminReceiptsListProps {
    receipts: TaxReceiptItem[];
    filteredReceipts: TaxReceiptItem[];
    searchQuery: string;
    onClearSearch: () => void;
}

export const AdminReceiptsList: React.FC<AdminReceiptsListProps> = ({
    receipts,
    filteredReceipts,
    searchQuery,
    onClearSearch,
}) => {
    const isReceiptsEmpty = receipts.length === 0;
    const isFilteredEmpty = filteredReceipts.length === 0;

    if (isReceiptsEmpty) {
        return (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <ReceiptText className="w-9 h-9 text-slate-400 dark:text-slate-500 mx-auto mb-2.5" />
                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                    Nenhuma nota fiscal registrada
                </p>
            </div>
        );
    }

    if (isFilteredEmpty) {
        return (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Search className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                    Nenhuma nota fiscal encontrada
                </p>
                <p className="text-xs text-app-graytext dark:text-slate-400 mt-1">
                    Nenhuma nota corresponde a &quot;{searchQuery}&quot;.
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
            {filteredReceipts.map((receipt) => {
                const isApproved = receipt.status === 'approved';
                const isPending = receipt.status === 'pending';

                return (
                    <div
                        key={receipt.id}
                        className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-app-graytext dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                <ReceiptText className="w-4 h-4" />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-extrabold text-app-navy dark:text-white">
                                        {formatCurrencyBRL(receipt.value)}
                                    </span>

                                    {receipt.user && (
                                        <span className="text-xs font-semibold text-app-graytext dark:text-slate-300">
                                            · {receipt.user.name}
                                        </span>
                                    )}

                                    {isApproved && (
                                        <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            <span>Aprovado</span>
                                        </span>
                                    )}

                                    {isPending && (
                                        <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>Em análise</span>
                                        </span>
                                    )}

                                    {!isApproved && !isPending && (
                                        <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>Rejeitado</span>
                                        </span>
                                    )}
                                </div>

                                <span className="block font-mono text-[11px] text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">
                                    {formatAccessKeyPreview(receipt.access_key)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pl-12 sm:pl-0">
                            <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap tabular-nums">
                                +{receipt.points_earned} pts
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
