import React from 'react';
import {
    Sparkles,
    Flame,
    Award,
    QrCode,
    Camera,
    ReceiptText,
    Check,
    Clock,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import type {
    DashboardTab,
    MyRankingPerformance,
    TaxReceiptItem,
    UserProfile,
} from '@/types/dashboard';

interface OverviewSectionProps {
    profile: UserProfile | null;
    performance: MyRankingPerformance | null;
    receipts: TaxReceiptItem[];
    hasNextReceiptsPage: boolean;
    isLoadingReceipts: boolean;
    onLoadMoreReceipts: () => void;
    onRefreshReceipts: () => void;
    onOpenScanModal: () => void;
    onNavigateTab: (tab: DashboardTab) => void;
}

function formatAccessKeyPreview(key: string): string {
    if (!key) {
        return '---- ---- ---- ---- ----...';
    }
    const clean = key.replace(/\D/g, '').slice(0, 20);
    const groups = clean.match(/.{1,4}/g) || [key.slice(0, 20)];
    return `${groups.join(' ')}...`;
}

function formatCurrencyBRL(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(num)) {
        return 'R$ 0,00';
    }
    return num.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatRelativeDateTime(dateString: string): string {
    if (!dateString) {
        return '';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    const timePart = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (isToday) {
        return `Hoje, ${timePart}`;
    }
    if (isYesterday) {
        return `Ontem, ${timePart}`;
    }

    const dayMonth = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
    });
    return `${dayMonth}, ${timePart}`;
}

function getDonorTierLabel(position?: number): string {
    if (!position) {
        return 'Doador Iniciante';
    }
    if (position <= 3) {
        return 'Doador Ouro';
    }
    if (position <= 10) {
        return 'Doador Prata';
    }
    return 'Doador Bronze';
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
    profile,
    performance,
    receipts,
    hasNextReceiptsPage,
    isLoadingReceipts,
    onLoadMoreReceipts,
    onRefreshReceipts,
    onOpenScanModal,
    onNavigateTab,
}) => {
    const currentBalance = profile?.current_balance ?? 0;
    const scanStreak = profile?.scan_streak ?? performance?.scan_streak ?? 0;
    const rankPosition = performance?.position;
    const totalNotesCount = Math.max(profile?.total_receipts ?? 0, receipts.length);

    return (
        <div className="space-y-6">
            {/* 1. Three KPI Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1: Pontos Acumulados */}
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Pontos Acumulados
                        </span>
                        <Sparkles className="w-4 h-4 text-[#4bb9a6]" />
                    </div>

                    <div className="my-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight">
                            {currentBalance.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs font-extrabold text-[#4bb9a6] uppercase tracking-wider">
                            PTS
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            {profile?.expiring_soon_points
                                ? `${profile.expiring_soon_points} pts expiram em breve`
                                : 'Saldo para resgates'}
                        </span>
                        <button
                            type="button"
                            onClick={() => onNavigateTab('rewards')}
                            className="text-[11px] font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                        >
                            Ver loja →
                        </button>
                    </div>
                </div>

                {/* Card 2: Sequência Solidária */}
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Sequência Solidária
                        </span>
                        <Flame className="w-4 h-4 text-[#ea7349]" />
                    </div>

                    <div className="my-3">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight">
                            {scanStreak} {scanStreak === 1 ? 'dia' : 'dias'}
                        </span>
                    </div>

                    <div className="pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            +10% bônus em notas consecutivas
                        </span>
                    </div>
                </div>

                {/* Card 3: Posição no Ranking */}
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Posição no Ranking
                        </span>
                        <Award className="w-4 h-4 text-[#ea7349]" />
                    </div>

                    <div className="my-3">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight">
                            {rankPosition ? `#${rankPosition}` : '#-'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            {getDonorTierLabel(rankPosition)}
                        </span>
                        <button
                            type="button"
                            onClick={() => onNavigateTab('ranking')}
                            className="text-[11px] font-bold text-[#ea7349] hover:underline cursor-pointer"
                        >
                            Ver ranking →
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. CTA Banner: Doar Cupom Fiscal para a APAE */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#4bb9a6]/15 dark:bg-[#112a2e] border border-[#4bb9a6]/25 dark:border-[#4bb9a6]/20 text-[#4bb9a6] flex items-center justify-center shrink-0">
                        <QrCode className="w-6 h-6" />
                    </div>

                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-app-navy dark:text-white tracking-tight">
                            Doar Cupom Fiscal para a APAE
                        </h2>
                        <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5 leading-relaxed">
                            Envie notas fiscais com ou sem CPF para gerar créditos para a APAE e acumular pontos para trocar por prêmios.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onOpenScanModal}
                    className="w-full sm:w-auto bg-[#4bb9a6] hover:bg-[#3da392] text-white text-xs font-extrabold uppercase tracking-wider px-5 py-3 rounded-xl inline-flex items-center justify-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer shrink-0"
                >
                    <Camera className="w-4 h-4" />
                    <span>ESCANEAR CUPOM</span>
                </button>
            </div>

            {/* 3. Últimos Cupons Doados */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h3 className="text-base font-extrabold text-app-navy dark:text-white tracking-tight">
                            Últimos Cupons Doados
                        </h3>
                        <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-0.5">
                            Validação assíncrona oficial
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onRefreshReceipts}
                            title="Atualizar status das notas"
                            aria-label="Atualizar status das notas"
                            className="p-1.5 rounded-lg text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <RefreshCw
                                className={`w-3.5 h-3.5 ${isLoadingReceipts ? 'animate-spin text-[#4bb9a6]' : ''}`}
                            />
                        </button>
                        <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 dark:border-[#4bb9a6]/20 text-[11px] font-bold px-3 py-1 rounded-full">
                            {totalNotesCount} {totalNotesCount === 1 ? 'nota' : 'notas'}
                        </span>
                    </div>
                </div>

                {receipts.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <ReceiptText className="w-9 h-9 text-slate-400 dark:text-slate-500 mx-auto mb-2.5" />
                        <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                            Nenhum cupom fiscal enviado ainda
                        </p>
                        <p className="text-xs text-app-graytext dark:text-slate-400 mt-1 max-w-md mx-auto">
                            Clique em &ldquo;Escanear Cupom&rdquo; para enviar sua primeira nota fiscal paulista e começar a pontuar.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
                        {receipts.map((receipt) => {
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
                                                    {isPending && Number(receipt.value) === 0
                                                        ? 'R$ --,--'
                                                        : formatCurrencyBRL(receipt.value)}
                                                </span>

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

                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 tracking-wider">
                                                    {formatAccessKeyPreview(receipt.access_key)}
                                                </span>

                                                {receipt.rejection_reason && (
                                                    <span className="text-[11px] text-rose-500 dark:text-rose-400/90 font-medium">
                                                        • {receipt.rejection_reason}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                                        <span className="text-[11px] text-app-graytext dark:text-slate-400 whitespace-nowrap">
                                            {formatRelativeDateTime(
                                                receipt.issue_date || receipt.created_at
                                            )}
                                        </span>

                                        {isApproved && (
                                            <span className="bg-[#4bb9a6]/15 dark:bg-[#112a2e] text-[#4bb9a6] border border-[#4bb9a6]/25 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap">
                                                +{receipt.points_earned} pts
                                            </span>
                                        )}

                                        {isPending && (
                                            <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap">
                                                Em análise
                                            </span>
                                        )}

                                        {!isApproved && !isPending && (
                                            <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap">
                                                Erro
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {hasNextReceiptsPage && (
                    <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
                        <button
                            type="button"
                            onClick={onLoadMoreReceipts}
                            disabled={isLoadingReceipts}
                            className="text-xs font-bold text-[#4bb9a6] hover:underline disabled:opacity-50 cursor-pointer"
                        >
                            {isLoadingReceipts ? 'Carregando...' : 'Carregar mais cupons'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverviewSection;
