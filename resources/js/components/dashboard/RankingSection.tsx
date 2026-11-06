import React, { useEffect, useMemo, useState } from 'react';
import {
    Flame,
    Sparkles,
    Search,
    Award,
    Trophy,
    X,
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

function useAnimatedNumber(target: number, durationMs = 700): number {
    const [display, setDisplay] = useState(target);

    useEffect(() => {
        let rafId: number;
        const startTime = performance.now();

        const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / durationMs);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(target * eased));

            if (progress < 1) {
                rafId = requestAnimationFrame(step);
            }
        };

        rafId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafId);
    }, [target, durationMs]);

    return display;
}

export const RankingSection: React.FC<RankingSectionProps> = ({
    currentUserId,
    ranking,
    performance,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [brokenAvatars, setBrokenAvatars] = useState<Record<number, boolean>>({});
    const [barsReady, setBarsReady] = useState(false);

    useEffect(() => {
        const timer = requestAnimationFrame(() => setBarsReady(true));
        return () => cancelAnimationFrame(timer);
    }, []);

    const myUser = useMemo(
        () => ranking.find((u) => u.id === currentUserId) || null,
        [ranking, currentUserId]
    );

    const myPosition = myUser?.position ?? performance?.position;
    const myTotalDonated = myUser?.total_donated ?? performance?.total_donated ?? 0;
    const myStreak = myUser?.scan_streak ?? performance?.scan_streak ?? 0;

    const animatedMyPoints = useAnimatedNumber(myTotalDonated, 750);

    const userAboveMe = useMemo(() => {
        if (!myPosition || myPosition <= 1) return null;
        return ranking.find((u) => u.position === myPosition - 1) || null;
    }, [ranking, myPosition]);

    const pointsNeededToAdvance = useMemo(() => {
        if (userAboveMe) {
            return Math.max(1, userAboveMe.total_donated - myTotalDonated + 1);
        }
        if (
            performance?.points_to_next_position !== null &&
            performance?.points_to_next_position !== undefined
        ) {
            return Math.max(1, performance.points_to_next_position);
        }
        return null;
    }, [userAboveMe, myTotalDonated, performance]);

    const progressToNextPct = useMemo(() => {
        if (!userAboveMe || userAboveMe.total_donated <= 0) return 100;
        return Math.min(
            96,
            Math.max(15, Math.round((myTotalDonated / userAboveMe.total_donated) * 100))
        );
    }, [myTotalDonated, userAboveMe]);

    const maxPoints = useMemo(() => {
        if (ranking.length === 0) return 1;
        return Math.max(1, ...ranking.map((u) => u.total_donated));
    }, [ranking]);

    const filteredRanking = useMemo(() => {
        const q = searchQuery.trim().toLowerCase().replace(/^@+/, '');
        if (!q) return ranking;
        return ranking.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                (u.nick && u.nick.toLowerCase().includes(q))
        );
    }, [ranking, searchQuery]);

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
                className={`${sizeClass} rounded-full bg-[#4bb9a6]/20 text-[#4bb9a6] font-extrabold ${textClass} flex items-center justify-center shrink-0 border border-[#4bb9a6]/30`}
            >
                {getInitials(user.name)}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* 1. Three KPI Metric Cards (Mesmo contraste da Visão Geral) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Sua Colocação Atual
                        </span>
                        <Award className="w-4 h-4 text-[#ea7349]" />
                    </div>

                    <div className="my-3 flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight tabular-nums">
                            {myPosition ? `#${myPosition}` : '#-'}
                        </span>
                        <span className="text-xs font-bold text-[#4bb9a6] uppercase tracking-wider">
                            de {ranking.length} alunos
                        </span>
                    </div>

                    <div className="pt-1 space-y-2">
                        {userAboveMe && pointsNeededToAdvance && (
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-[#111827] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#4bb9a6] rounded-full transition-all duration-700 ease-out"
                                    style={{ width: barsReady ? `${progressToNextPct}%` : '0%' }}
                                />
                            </div>
                        )}
                        <span className="block text-[11px] text-app-graytext dark:text-slate-400">
                            {userAboveMe && pointsNeededToAdvance
                                ? `Faltam ${pointsNeededToAdvance.toLocaleString('pt-BR')} pts para #${userAboveMe.position} (${userAboveMe.name.split(' ')[0]})`
                                : myPosition === 1
                                  ? 'Você lidera as doações no semestre'
                                  : 'Escaneie cupons para subir posições'}
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Seus Pontos no Ranking
                        </span>
                        <Sparkles className="w-4 h-4 text-[#4bb9a6]" />
                    </div>

                    <div className="my-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight tabular-nums">
                            {animatedMyPoints.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs font-extrabold text-[#4bb9a6] uppercase tracking-wider">
                            PTS
                        </span>
                    </div>

                    <div className="pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            Acumulados em cupons destinados à APAE
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-app-graytext dark:text-slate-400">
                            Sequência Solidária
                        </span>
                        <Flame className="w-4 h-4 text-[#ea7349]" />
                    </div>

                    <div className="my-3">
                        <span className="text-3xl sm:text-4xl font-extrabold text-app-navy dark:text-white tracking-tight tabular-nums">
                            {myStreak} {myStreak === 1 ? 'dia' : 'dias'}
                        </span>
                    </div>

                    <div className="pt-1">
                        <span className="text-[11px] text-app-graytext dark:text-slate-400">
                            +10% bônus em doações consecutivas
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Lista com Barras Horizontais Vivas (Estilo GitHub / Linear) */}
            <div className="bg-white dark:bg-[#182234] border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4bb9a6]/15 dark:bg-[#112a2e] border border-[#4bb9a6]/25 text-[#4bb9a6] flex items-center justify-center shrink-0">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-app-navy dark:text-white tracking-tight">
                                Classificação Geral FATEC
                            </h3>
                            <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-0.5">
                                A barra em cada linha representa o impacto proporcional ao 1º colocado
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2 focus-within:border-[#4bb9a6] transition-colors w-full sm:w-64">
                        <Search className="w-4 h-4 text-app-graytext dark:text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar aluno ou @nick..."
                            className="w-full bg-transparent text-xs text-app-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {filteredRanking.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <p className="text-xs font-bold text-app-navy dark:text-slate-300">
                            Nenhum estudante encontrado
                        </p>
                        <p className="text-[11px] text-app-graytext dark:text-slate-400 mt-1">
                            Verifique o nome ou @nickname pesquisado.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRanking.map((item, idx) => {
                            const isMe = currentUserId === item.id;
                            const barWidth = Math.max(
                                8,
                                Math.round((item.total_donated / maxPoints) * 100)
                            );

                            let positionBadge =
                                'bg-slate-100 dark:bg-slate-800 text-app-navy dark:text-slate-200 border-slate-200 dark:border-slate-700';
                            let barFillStyle =
                                'bg-gradient-to-r from-[#4bb9a6]/25 via-[#4bb9a6]/15 to-[#4bb9a6]/5 dark:from-[#4bb9a6]/25 dark:via-[#4bb9a6]/15 dark:to-transparent';

                            if (item.position === 1) {
                                positionBadge =
                                    'bg-amber-400/20 text-amber-600 dark:text-amber-300 border-amber-400/40';
                                barFillStyle =
                                    'bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-transparent dark:from-amber-500/30 dark:via-amber-500/15 dark:to-transparent';
                            } else if (item.position === 2) {
                                positionBadge =
                                    'bg-slate-300/35 dark:bg-slate-700 text-slate-700 dark:text-slate-100 border-slate-400/40';
                                barFillStyle =
                                    'bg-gradient-to-r from-[#4bb9a6]/30 via-[#4bb9a6]/18 to-transparent';
                            } else if (item.position === 3) {
                                positionBadge =
                                    'bg-[#ea7349]/20 text-[#ea7349] border-[#ea7349]/40';
                                barFillStyle =
                                    'bg-gradient-to-r from-[#ea7349]/25 via-[#ea7349]/15 to-transparent';
                            }

                            return (
                                <div
                                    key={item.id}
                                    className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:translate-x-1 ${
                                        isMe
                                            ? 'border-[#4bb9a6] bg-[#4bb9a6]/10 dark:bg-[#112a2e]/70 shadow-xs'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] hover:border-[#4bb9a6]/50'
                                    }`}
                                >
                                    {/* Barra proporcional viva */}
                                    <div
                                        className={`absolute inset-y-0 left-0 pointer-events-none transition-all duration-700 ease-out ${barFillStyle}`}
                                        style={{
                                            width: barsReady ? `${barWidth}%` : '0%',
                                            transitionDelay: `${idx * 45}ms`,
                                        }}
                                    />

                                    <div className="relative z-10 px-4 py-3.5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <span
                                                className={`w-8 h-8 rounded-lg text-xs font-black border inline-flex items-center justify-center tabular-nums shrink-0 ${positionBadge}`}
                                            >
                                                {item.position}º
                                            </span>

                                            {renderAvatar(item, 'w-10 h-10', 'text-xs')}

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-extrabold text-app-navy dark:text-white truncate">
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

                                        <div className="flex items-center gap-4 sm:gap-5 shrink-0">
                                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#ea7349] bg-[#ea7349]/12 border border-[#ea7349]/25 px-2.5 py-1 rounded-full tabular-nums">
                                                <Flame className="w-3.5 h-3.5" />
                                                <span>
                                                    {item.scan_streak}{' '}
                                                    {item.scan_streak === 1 ? 'dia' : 'dias'}
                                                </span>
                                            </span>

                                            <span className="text-sm sm:text-base font-black text-app-navy dark:text-white tabular-nums w-24 text-right">
                                                {item.total_donated.toLocaleString('pt-BR')}{' '}
                                                <span className="text-xs font-bold text-[#4bb9a6]">
                                                    pts
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RankingSection;
