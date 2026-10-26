import React, { useState } from 'react';
import {
    Trophy,
    Flame,
    Crown,
    Medal,
    TrendingUp,
} from 'lucide-react';
import type {
    MyRankingPerformance,
    RankingUser,
} from '@/types/dashboard';

interface RankingSectionProps {
    currentUserId?: number;
    ranking: RankingUser[];
    performance: MyRankingPerformance | null;
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

export const RankingSection: React.FC<RankingSectionProps> = ({
    currentUserId,
    ranking,
    performance,
}) => {
    const [brokenAvatars, setBrokenAvatars] = useState<Record<number, boolean>>({});

    const myPosition = performance?.position;
    const myTotalDonated = performance?.total_donated ?? 0;
    const myStreak = performance?.scan_streak ?? 0;
    const rawPointsToNext = performance?.points_to_next_position;
    const nextPosition = performance?.next_position;

    const pointsNeededToAdvance =
        rawPointsToNext !== null && rawPointsToNext !== undefined
            ? Math.max(1, rawPointsToNext)
            : null;

    const topThree = ranking.slice(0, 3);

    // Desktop podium order: 2º (left), 1º (center), 3º (right)
    const podiumOrder: Array<{ user: RankingUser; rank: 1 | 2 | 3 }> = [];
    if (topThree[1]) podiumOrder.push({ user: topThree[1], rank: 2 });
    if (topThree[0]) podiumOrder.push({ user: topThree[0], rank: 1 });
    if (topThree[2]) podiumOrder.push({ user: topThree[2], rank: 3 });

    const renderAvatar = (user: RankingUser, sizeClass: string, textClass: string) => {
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
        <div className="space-y-8">
            {/* 1. Resumo Pessoal no Ranking */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#4bb9a6]/15 border border-[#4bb9a6]/25 text-[#4bb9a6] flex items-center justify-center shrink-0">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4bb9a6]">
                                    Seu Desempenho
                                </span>
                                {myPosition === 1 && (
                                    <span className="bg-amber-400/20 text-amber-500 border border-amber-400/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                        1º Lugar
                                    </span>
                                )}
                            </div>
                            <h2 className="text-base sm:text-lg font-extrabold text-app-navy dark:text-white mt-0.5">
                                {myPosition
                                    ? `Você está na ${myPosition}ª colocação geral`
                                    : 'Você ainda não entrou na classificação'}
                            </h2>
                            <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5">
                                {pointsNeededToAdvance && nextPosition
                                    ? `Faltam ${pointsNeededToAdvance.toLocaleString('pt-BR')} pts para alcançar a #${nextPosition}ª posição.`
                                    : myPosition === 1
                                      ? 'Você lidera o ranking de doações de cupons fiscais!'
                                      : 'Escaneie cupons fiscais para acumular pontos e subir posições.'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-200/70 dark:border-slate-800">
                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-app-graytext dark:text-slate-400">
                                Posição
                            </span>
                            <span className="block text-lg sm:text-xl font-black text-app-navy dark:text-white tabular-nums mt-0.5">
                                {myPosition ? `#${myPosition}` : '-'}
                            </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-app-graytext dark:text-slate-400">
                                Pontos
                            </span>
                            <span className="block text-lg sm:text-xl font-black text-[#4bb9a6] tabular-nums mt-0.5">
                                {myTotalDonated.toLocaleString('pt-BR')}
                            </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200/70 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-app-graytext dark:text-slate-400">
                                Ofensiva
                            </span>
                            <span className="inline-flex items-center justify-center gap-1 text-lg sm:text-xl font-black text-[#ea7349] tabular-nums mt-0.5">
                                <Flame className="w-4 h-4 shrink-0" />
                                <span>{myStreak}d</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Pódio Top 3 Minimalista (Estilo SaaS) */}
            {topThree.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-3">
                    {podiumOrder.map(({ user, rank }) => {
                        const isMe = currentUserId === user.id;
                        const isFirst = rank === 1;
                        const isSecond = rank === 2;

                        const cardClass = isFirst
                            ? 'bg-white dark:bg-[#182234] border-amber-300/80 dark:border-amber-500/40 shadow-md md:-translate-y-3 order-1 md:order-2'
                            : isSecond
                              ? 'bg-white dark:bg-[#182234] border-slate-200/80 dark:border-slate-800/90 shadow-xs order-2 md:order-1'
                              : 'bg-white dark:bg-[#182234] border-slate-200/80 dark:border-slate-800/90 shadow-xs order-3';

                        const topPillClass = isFirst
                            ? 'bg-amber-500 text-white shadow-xs'
                            : isSecond
                              ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                              : 'bg-amber-500/10 border border-amber-600/20 text-amber-700 dark:text-amber-400';

                        const avatarRingClass = isFirst
                            ? 'ring-4 ring-amber-400/30'
                            : isSecond
                              ? 'ring-2 ring-slate-200 dark:ring-slate-700'
                              : 'ring-2 ring-amber-700/25 dark:ring-amber-600/30';

                        const numberBadgeClass = isFirst
                            ? 'bg-amber-500 text-white'
                            : isSecond
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                              : 'bg-amber-700 text-white';

                        return (
                            <div
                                key={user.id}
                                className={`relative border rounded-2xl p-6 flex flex-col items-center transition-all ${cardClass}`}
                            >
                                {/* Floating Top Badge */}
                                <div
                                    className={`absolute -top-3 px-3 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${topPillClass}`}
                                >
                                    {isFirst && <Crown className="w-3 h-3 fill-current" />}
                                    <span>{rank}º Lugar</span>
                                </div>

                                {/* Avatar + Corner Number */}
                                <div className="relative mt-2 mb-3">
                                    <div className={`rounded-full ${avatarRingClass}`}>
                                        {renderAvatar(
                                            user,
                                            isFirst ? 'w-18 h-18' : 'w-14 h-14',
                                            isFirst ? 'text-base' : 'text-sm'
                                        )}
                                    </div>
                                    <span
                                        className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white dark:border-[#182234] text-[10px] font-bold flex items-center justify-center tabular-nums ${numberBadgeClass}`}
                                    >
                                        {rank}
                                    </span>
                                </div>

                                {/* Name & Handle */}
                                <div className="flex items-center gap-1.5 max-w-full">
                                    <h3 className="text-sm sm:text-base font-bold text-app-navy dark:text-white truncate">
                                        {user.name}
                                    </h3>
                                    {isMe && (
                                        <span className="bg-[#4bb9a6]/15 text-[#4bb9a6] text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                            Você
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5 mb-4 h-4">
                                    {user.nick ? `@${user.nick}` : ''}
                                </p>

                                {/* Clean Bottom Footer Line */}
                                <div className="w-full pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                    <span className="inline-flex items-center gap-1 text-app-graytext dark:text-slate-400 font-medium tabular-nums">
                                        <Flame className="w-3.5 h-3.5 text-[#ea7349]" />
                                        <span>
                                            {user.scan_streak}{' '}
                                            {user.scan_streak === 1 ? 'dia' : 'dias'}
                                        </span>
                                    </span>

                                    <span
                                        className={`text-sm font-extrabold tabular-nums ${
                                            isFirst
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-app-navy dark:text-white'
                                        }`}
                                    >
                                        {user.total_donated.toLocaleString('pt-BR')} pts
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 3. Tabela de Classificação Geral (Top 10) */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <TrendingUp className="w-4 h-4 text-[#4bb9a6]" />
                        <h3 className="text-base font-extrabold text-app-navy dark:text-white tracking-tight">
                            Classificação Geral
                        </h3>
                    </div>

                    <span className="bg-slate-100 dark:bg-slate-800 text-app-graytext dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shrink-0 tabular-nums">
                        <Medal className="w-3.5 h-3.5 text-[#4bb9a6]" />
                        <span>Top {ranking.length}</span>
                    </span>
                </div>

                {ranking.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <Trophy className="w-9 h-9 text-slate-400 dark:text-slate-500 mx-auto mb-2.5" />
                        <p className="text-sm font-bold text-app-navy dark:text-slate-300">
                            Nenhuma pontuação registrada ainda
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/70 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#141d2e] text-[11px] font-extrabold uppercase tracking-wider text-app-graytext dark:text-slate-400">
                                    <th className="py-3.5 pl-5 sm:pl-6 pr-3 w-20">Posição</th>
                                    <th className="py-3.5 px-3">Participante</th>
                                    <th className="py-3.5 px-3 text-center w-32">Ofensiva</th>
                                    <th className="py-3.5 pl-3 pr-5 sm:pr-6 text-right w-36">
                                        Pontuação
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/70 text-sm">
                                {ranking.map((item) => {
                                    const isMe = currentUserId === item.id;

                                    let positionBadge =
                                        'bg-slate-100 dark:bg-slate-800 text-app-graytext dark:text-slate-300 border-slate-200 dark:border-slate-700';
                                    if (item.position === 1) {
                                        positionBadge =
                                            'bg-amber-400/20 text-amber-600 dark:text-amber-300 border-amber-400/40';
                                    } else if (item.position === 2) {
                                        positionBadge =
                                            'bg-slate-300/30 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-400/40';
                                    } else if (item.position === 3) {
                                        positionBadge =
                                            'bg-amber-700/20 text-amber-700 dark:text-amber-400 border-amber-600/40';
                                    }

                                    return (
                                        <tr
                                            key={item.id}
                                            className={`transition-colors ${
                                                isMe
                                                    ? 'bg-[#4bb9a6]/10 dark:bg-[#112a2e]/50'
                                                    : 'hover:bg-slate-50/80 dark:hover:bg-[#141d2e]/60'
                                            }`}
                                        >
                                            <td className="py-3.5 pl-5 sm:pl-6 pr-3 whitespace-nowrap">
                                                <span
                                                    className={`w-8 h-8 rounded-lg text-xs font-black border inline-flex items-center justify-center tabular-nums ${positionBadge}`}
                                                >
                                                    {item.position}º
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {renderAvatar(item, 'w-9 h-9', 'text-xs')}
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-extrabold text-app-navy dark:text-white truncate">
                                                                {item.name}
                                                            </span>
                                                            {isMe && (
                                                                <span className="bg-[#4bb9a6] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                                                                    Você
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.nick && (
                                                            <span className="block text-xs font-semibold text-[#4bb9a6] truncate">
                                                                @{item.nick}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#ea7349] bg-[#ea7349]/10 border border-[#ea7349]/20 px-2.5 py-1 rounded-full tabular-nums">
                                                    <Flame className="w-3.5 h-3.5" />
                                                    <span>
                                                        {item.scan_streak}{' '}
                                                        {item.scan_streak === 1 ? 'dia' : 'dias'}
                                                    </span>
                                                </span>
                                            </td>

                                            <td className="py-3.5 pl-3 pr-5 sm:pr-6 text-right whitespace-nowrap">
                                                <span className="text-sm font-black text-app-navy dark:text-white tabular-nums">
                                                    {item.total_donated.toLocaleString('pt-BR')}{' '}
                                                    <span className="text-xs font-bold text-[#4bb9a6]">
                                                        pts
                                                    </span>
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RankingSection;
