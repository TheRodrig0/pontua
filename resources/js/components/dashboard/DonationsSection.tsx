import React, { useEffect, useMemo, useState } from 'react';
import {
    Send,
    History,
    Search,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Wallet,
    ArrowUpRight,
    X,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import type { PointDonationItem, RankingUser } from '@/types/dashboard';

interface RecipientCandidate {
    id: number;
    name: string;
    nick: string | null;
    avatar_url: string | null;
}

interface DonationsSectionProps {
    currentBalance: number;
    currentUserId?: number;
    rankingUsers: RankingUser[];
    donations: PointDonationItem[];
    hasNextDonationsPage: boolean;
    isLoadingDonations: boolean;
    onLoadMoreDonations: () => void;
    onDonationCreated: (donation: PointDonationItem) => void;
}

function getInitials(name: string): string {
    if (!name || !name.trim()) {
        return 'AL';
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

export const DonationsSection: React.FC<DonationsSectionProps> = ({
    currentBalance,
    currentUserId,
    rankingUsers,
    donations,
    hasNextDonationsPage,
    isLoadingDonations,
    onLoadMoreDonations,
    onDonationCreated,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [remoteUsers, setRemoteUsers] = useState<RecipientCandidate[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState<RecipientCandidate | null>(null);
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [brokenAvatars, setBrokenAvatars] = useState<Record<number, boolean>>({});

    // Busca no servidor (/api/donation/users?q=...) por nome ou @nick
    useEffect(() => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setRemoteUsers([]);
            setIsSearchingUsers(false);
            return;
        }

        let cancelled = false;
        setIsSearchingUsers(true);

        const timer = setTimeout(async () => {
            try {
                const res = await apiRequest<RecipientCandidate[]>(
                    `/api/donation/users?q=${encodeURIComponent(trimmed)}`
                );
                if (!cancelled) {
                    setRemoteUsers(Array.isArray(res) ? res : []);
                }
            } catch {
                if (!cancelled) {
                    setRemoteUsers([]);
                }
            } finally {
                if (!cancelled) {
                    setIsSearchingUsers(false);
                }
            }
        }, 180);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [searchQuery]);

    // Combina filtro local instantâneo + resultado do banco (suportando busca com ou sem '@')
    const searchResults = useMemo(() => {
        const raw = searchQuery.trim();
        if (!raw) {
            return [];
        }

        const startsWithAt = raw.startsWith('@');
        const cleanQuery = normalizeText(raw.replace(/^@+/, ''));

        const localMatches: RecipientCandidate[] = rankingUsers
            .filter((u) => u.id !== currentUserId)
            .filter((user) => {
                const normalizedNick = user.nick ? normalizeText(user.nick) : '';
                const normalizedName = normalizeText(user.name);

                if (startsWithAt) {
                    if (!normalizedNick) {
                        return false;
                    }
                    return cleanQuery === '' || normalizedNick.includes(cleanQuery);
                }

                return (
                    normalizedName.includes(cleanQuery) ||
                    (normalizedNick !== '' && normalizedNick.includes(cleanQuery))
                );
            });

        const mergedMap = new Map<number, RecipientCandidate>();
        for (const u of remoteUsers) {
            if (u.id !== currentUserId) {
                mergedMap.set(u.id, u);
            }
        }
        for (const u of localMatches) {
            if (!mergedMap.has(u.id)) {
                mergedMap.set(u.id, u);
            }
        }

        return Array.from(mergedMap.values());
    }, [searchQuery, remoteUsers, rankingUsers, currentUserId]);

    const handleSelectRecipient = (user: RecipientCandidate) => {
        setSelectedRecipient(user);
        setSearchQuery('');
        setErrorMessage(null);
    };

    const handleClearRecipient = () => {
        setSelectedRecipient(null);
        setSearchQuery('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!selectedRecipient) {
            setErrorMessage('Pesquise pelo nome ou @ e selecione a pessoa destinatária.');
            return;
        }

        const parsedAmount = parseInt(amount, 10);

        if (!parsedAmount || parsedAmount < 1) {
            setErrorMessage('Informe uma quantidade mínima de 1 ponto.');
            return;
        }
        if (parsedAmount > currentBalance) {
            setErrorMessage('Você não possui saldo suficiente para realizar esta transferência.');
            return;
        }

        setIsSubmitting(true);
        try {
            const created = await apiRequest<PointDonationItem>('/api/donation', {
                method: 'POST',
                body: JSON.stringify({
                    recipient_id: selectedRecipient.id,
                    amount: parsedAmount,
                }),
            });

            setSuccessMessage(
                `Você transferiu ${parsedAmount.toLocaleString('pt-BR')} pts para ${selectedRecipient.name}${selectedRecipient.nick ? ` (@${selectedRecipient.nick})` : ''}.`
            );
            setAmount('');
            setSelectedRecipient(null);
            setSearchQuery('');
            onDonationCreated(created);
        } catch (error: any) {
            setErrorMessage(
                error.message || 'Falha ao transferir pontos. Verifique os dados informados.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderAvatar = (user: RecipientCandidate, sizeClass: string, textClass: string) => {
        if (user.avatar_url && !brokenAvatars[user.id]) {
            return (
                <img
                    src={user.avatar_url}
                    alt={user.name}
                    onError={() =>
                        setBrokenAvatars((prev) => ({ ...prev, [user.id]: true }))
                    }
                    className={`${sizeClass} rounded-full object-cover shrink-0`}
                />
            );
        }

        return (
            <div
                className={`${sizeClass} rounded-full bg-slate-100 dark:bg-slate-800 text-app-navy dark:text-slate-200 font-bold ${textClass} flex items-center justify-center shrink-0`}
            >
                {getInitials(user.name)}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Coluna Esquerda: Formulário de Doação */}
            <div className="lg:col-span-7 bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100 dark:border-slate-800/80">
                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-app-navy dark:text-white tracking-tight">
                            Doar Pontos
                        </h2>
                        <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5">
                            Pesquise pelo nome ou pelo @ da pessoa para enviar pontos
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shrink-0">
                        <Wallet className="w-4 h-4 text-[#4bb9a6]" />
                        <div className="text-xs">
                            <span className="text-app-graytext dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                                Seu Saldo
                            </span>
                            <span className="font-black text-app-navy dark:text-white tabular-nums text-sm">
                                {currentBalance.toLocaleString('pt-BR')}{' '}
                                <span className="text-[#4bb9a6] text-xs">pts</span>
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {errorMessage && (
                        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Campo 1: Pesquisar pelo Nome ou @ */}
                    <div>
                        <label
                            htmlFor="donate-search-user"
                            className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-2"
                        >
                            Destinatário (Nome ou @)
                        </label>

                        {selectedRecipient ? (
                            <div className="bg-slate-50 dark:bg-[#111827] border border-[#4bb9a6]/50 rounded-xl p-3.5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {renderAvatar(selectedRecipient, 'w-10 h-10', 'text-xs')}
                                    <div className="min-w-0">
                                        <span className="block text-sm font-bold text-app-navy dark:text-white truncate">
                                            {selectedRecipient.name}
                                        </span>
                                        {selectedRecipient.nick && (
                                            <span className="block text-xs text-[#4bb9a6] font-medium truncate">
                                                @{selectedRecipient.nick}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClearRecipient}
                                    className="p-1.5 rounded-lg text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Alterar destinatário"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-3 flex items-center gap-2.5 focus-within:border-[#4bb9a6] transition-colors">
                                    <Search className="w-4 h-4 text-app-graytext dark:text-slate-400 shrink-0" />
                                    <input
                                        id="donate-search-user"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Digite o nome ou @apelido..."
                                        autoComplete="off"
                                        className="w-full bg-transparent text-sm text-app-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                                    />
                                    {isSearchingUsers && (
                                        <Loader2 className="w-4 h-4 text-[#4bb9a6] animate-spin shrink-0" />
                                    )}
                                    {searchQuery && !isSearchingUsers && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Resultados da busca por nome ou @ */}
                                {searchQuery.trim().length > 0 && (
                                    <div className="mt-2 bg-white dark:bg-[#141d2e] border border-slate-200 dark:border-slate-700/90 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
                                        {searchResults.length === 0 && !isSearchingUsers ? (
                                            <div className="p-4 text-center text-xs text-app-graytext dark:text-slate-400">
                                                Nenhuma pessoa encontrada para &ldquo;{searchQuery}&rdquo;.
                                            </div>
                                        ) : (
                                            searchResults.map((user) => (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => handleSelectRecipient(user)}
                                                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        {renderAvatar(user, 'w-9 h-9', 'text-xs')}
                                                        <div className="min-w-0">
                                                            <span className="block text-sm font-bold text-app-navy dark:text-white truncate">
                                                                {user.name}
                                                            </span>
                                                            {user.nick && (
                                                                <span className="block text-xs text-[#4bb9a6] font-medium truncate">
                                                                    @{user.nick}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <span className="text-xs font-semibold text-[#4bb9a6] shrink-0">
                                                        Selecionar
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Campo 2: Quantidade de Pontos */}
                    <div>
                        <label
                            htmlFor="donate-points-amount"
                            className="block text-xs font-bold text-app-navy dark:text-slate-200 mb-2"
                        >
                            Quantidade de pontos
                        </label>
                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-3 flex items-center gap-2.5 focus-within:border-[#4bb9a6] transition-colors">
                            <Sparkles className="w-4 h-4 text-[#4bb9a6] shrink-0" />
                            <input
                                id="donate-points-amount"
                                type="number"
                                min={1}
                                max={Math.max(1, currentBalance)}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Digite a quantidade de pontos"
                                className="w-full bg-transparent text-sm text-app-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none tabular-nums"
                                required
                            />
                            <span className="text-xs font-bold text-app-graytext dark:text-slate-400 shrink-0">
                                pts
                            </span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !selectedRecipient ||
                                !amount ||
                                currentBalance <= 0
                            }
                            className="w-full bg-[#4bb9a6] hover:bg-[#3da392] disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>
                                {isSubmitting ? 'Transferindo...' : 'Transferir Pontos'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Coluna Direita: Histórico de Transferências */}
            <div className="lg:col-span-5 bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-[#4bb9a6]" />
                        <h3 className="text-sm font-extrabold text-app-navy dark:text-white tracking-tight">
                            Minhas Transferências
                        </h3>
                    </div>
                    <span className="bg-slate-100 dark:bg-slate-800 text-app-graytext dark:text-slate-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full tabular-nums">
                        {donations.length}
                    </span>
                </div>

                {donations.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <Send className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-bold text-app-navy dark:text-slate-300">
                            Nenhuma transferência realizada
                        </p>
                        <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-1">
                            Suas doações de pontos para outros alunos aparecerão aqui.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                        {donations.map((donation) => {
                            const recipientUser = rankingUsers.find(
                                (u) => u.id === donation.recipient_id
                            );

                            return (
                                <div
                                    key={donation.id}
                                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-[#4bb9a6]/15 text-[#4bb9a6] flex items-center justify-center shrink-0">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block font-bold text-app-navy dark:text-white truncate">
                                                {recipientUser
                                                    ? recipientUser.name
                                                    : `Destinatário #${donation.recipient_id}`}
                                            </span>
                                            <span className="block text-[11px] text-app-graytext dark:text-slate-400">
                                                {new Date(
                                                    donation.created_at
                                                ).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <span className="font-extrabold text-app-navy dark:text-white shrink-0 tabular-nums">
                                        -{donation.amount.toLocaleString('pt-BR')}{' '}
                                        <span className="text-[#4bb9a6] text-[11px]">pts</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {hasNextDonationsPage && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
                        <button
                            type="button"
                            onClick={onLoadMoreDonations}
                            disabled={isLoadingDonations}
                            className="text-xs font-bold text-[#4bb9a6] hover:underline cursor-pointer"
                        >
                            {isLoadingDonations ? 'Carregando...' : 'Ver mais transferências'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationsSection;
