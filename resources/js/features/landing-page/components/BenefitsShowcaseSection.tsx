import React, { useState } from 'react'
import {
    Award,
    CheckCircle2,
    Flame,
    Send,
    Shirt,
    ShoppingBag,
    Trophy,
    Wallet,
    type LucideIcon,
} from 'lucide-react'
import LandingSectionHeader from './LandingSectionHeader'

const RewardShowcaseKey = {
    AACC: 'aacc',
    STORE: 'store',
    RANKING: 'ranking',
    TRANSFER: 'transfer',
} as const

type RewardShowcaseKey = (typeof RewardShowcaseKey)[keyof typeof RewardShowcaseKey]

interface RewardShowcaseTab {
    id: RewardShowcaseKey
    kicker: string
    title: string
    description: string
    icon: LucideIcon
}

const REWARD_TABS: readonly RewardShowcaseTab[] = [
    {
        id: RewardShowcaseKey.AACC,
        kicker: 'Horas AACC',
        title: 'Certificado em PDF para a FATEC',
        description:
            'Resgate horas complementares, salve a declaração oficial com código de autenticidade e anexe no SIGA.',
        icon: Award,
    },
    {
        id: RewardShowcaseKey.STORE,
        kicker: 'Loja da Unidade',
        title: 'Brindes e itens oficiais do campus',
        description:
            'Troque seus pontos por itens da FATEC e retire na secretaria apresentando o código do resgate.',
        icon: ShoppingBag,
    },
    {
        id: RewardShowcaseKey.RANKING,
        kicker: 'Ofensiva e Ranking',
        title: 'Classificação geral da FATEC',
        description:
            'Acompanhe o placar proporcional ao 1º colocado e mantenha sua sequência solidária ativa.',
        icon: Trophy,
    },
    {
        id: RewardShowcaseKey.TRANSFER,
        kicker: 'Entre Estudantes',
        title: 'Doar pontos pelo nome ou @',
        description:
            'Transfira pontos na hora e sem taxa para qualquer estudante da FATEC usando o @apelido.',
        icon: Send,
    },
]

interface ShowcaseRankingRow {
    position: number
    name: string
    nick: string
    avatar: string
    streak: number
    points: number
    isMe?: boolean
}

const RANKING_PREVIEW_ROWS: readonly ShowcaseRankingRow[] = [
    {
        position: 1,
        name: 'Lucas Almeida',
        nick: 'lucas.gti',
        avatar: '/avatars/1.webp',
        streak: 12,
        points: 1240,
    },
    {
        position: 2,
        name: 'Mariana Costa',
        nick: 'mariana.gti',
        avatar: '/avatars/2.webp',
        streak: 8,
        points: 980,
    },
    {
        position: 3,
        name: 'Rafael Oliveira',
        nick: 'rafael.fatec',
        avatar: '/avatars/3.webp',
        streak: 5,
        points: 740,
        isMe: true,
    },
    {
        position: 4,
        name: 'Beatriz Lima',
        nick: 'bia.gti',
        avatar: '/avatars/4.webp',
        streak: 3,
        points: 610,
    },
]

const MAX_RANKING_POINTS = RANKING_PREVIEW_ROWS[0].points

/**
 * Réplica fidedigna do template A4 paisagem gerado por printAaccCertificate.ts.
 */
const AaccCertificatePreview: React.FC = () => (
    <div className="w-full max-w-[580px] aspect-[297/210] bg-white border-[1.5px] border-[#e2e8f0] shadow-[0_12px_32px_rgba(59,71,92,0.08)] px-[7.5%] py-[6.5%] flex flex-col items-center text-center relative overflow-hidden text-[#3b475c]">
        {/* 1. Header (Logo exata + Certificado) */}
        <div className="w-full">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
                    aria-hidden="true"
                >
                    <g transform="rotate(-6 24 24)">
                        <rect x="2" y="2" width="44" height="44" rx="10" fill="#4BB9A6" />
                        <g transform="translate(12, 12)">
                            <path
                                fill="#FFFFFF"
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M 4 5.75 C 4 4.5 5 3.5 6.25 3.5 H 14 C 17.5 3.5 20.25 6.1 20.25 9.25 C 20.25 12.35 17.5 14.5 14 14.5 H 8 V 18.75 C 8 19.7 7.2 20.5 6.25 20.5 C 5.3 20.5 4 19.7 4 18.75 V 5.75 Z M 8 7 V 11.25 H 13.75 C 15.2 11.25 16.5 10.35 16.5 9.2 C 16.5 8 15.2 7 13.75 7 H 8 Z"
                            />
                            <circle cx="17.75" cy="18.25" r="2.25" fill="#EA7349" />
                        </g>
                    </g>
                </svg>
                <span className="text-sm sm:text-base font-black text-[#3b475c] tracking-[-0.05em]">
                    PONTUA<span className="text-[#ea7349]">.</span>
                </span>
            </div>

            <div className="text-base sm:text-[22px] font-extrabold tracking-[0.18em] text-[#273142] leading-[1.1]">
                CERTIFICADO
            </div>
            <div className="mt-1 sm:mt-1.5 text-[7px] sm:text-[8.5px] font-semibold uppercase tracking-[0.2em] text-[#4bb9a6]">
                ATIVIDADES COMPLEMENTARES • AACC
            </div>
        </div>

        {/* 2. Corpo Central */}
        <div className="w-full mt-3.5 sm:mt-6">
            <div className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.2em] text-[#7a889b] mb-1 sm:mb-1.5">
                Certificamos que
            </div>
            <div className="text-lg sm:text-[25px] font-extrabold text-[#273142] leading-[1.15] tracking-[-0.02em]">
                Estudante FATEC
            </div>
            <div className="w-24 sm:w-36 h-[2px] bg-[#ea7349] mx-auto my-2 sm:my-3" />
            <p className="max-w-[92%] mx-auto text-[8.5px] sm:text-[10.5px] leading-[1.65] text-[#3b475c] m-0">
                participou das ações de engajamento social e arrecadação fiscal na{' '}
                <strong className="text-[#273142]">FATEC Franco da Rocha</strong> em apoio à{' '}
                <strong className="text-[#273142]">APAE</strong>, totalizando o cumprimento de{' '}
                <strong className="text-[#273142] whitespace-nowrap">10 horas</strong> de
                atividades complementares.
            </p>
        </div>

        {/* 3. Rodapé posicionado naturalmente na base da folha A4 */}
        <div className="w-full mt-auto pt-3">
            <div className="w-full h-[1.5px] bg-[#f1f5f9] mb-2.5 sm:mb-3.5" />
            <div className="w-full flex items-center justify-between gap-3">
                <div className="flex flex-col items-start">
                    <span className="text-[6.5px] sm:text-[7.5px] font-bold uppercase tracking-[0.14em] text-[#7a889b] mb-0.5">
                        Data de Emissão
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-semibold text-[#273142] tabular-nums">
                        18/11/2026
                    </span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[6.5px] sm:text-[7.5px] font-bold uppercase tracking-[0.14em] text-[#7a889b] mb-0.5">
                        Código de Autenticidade
                    </span>
                    <span className="font-mono text-[8.5px] sm:text-[10px] font-extrabold text-[#273142] tracking-[0.1em] bg-[#f8fafc] border-[1.5px] border-[#9aa6b8] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-[5px]">
                        RES-7H4K9M2P
                    </span>
                </div>
            </div>
        </div>
    </div>
)

/**
 * Réplica fidedigna da Loja de Prêmios + Meus Resgates de RewardsStoreSection.tsx.
 */
const StorePreview: React.FC = () => (
    <div className="w-full max-w-[540px] space-y-3.5">
        <div className="bg-white dark:bg-app-darkcard border border-slate-200/80 dark:border-slate-800/90 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative h-32 sm:h-36 w-full bg-[#22354a] border-b border-white/10 flex items-center justify-center">
                <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 flex items-center justify-center">
                    <Shirt className="w-8 h-8 text-white" strokeWidth={1.75} />
                </div>

                <span className="absolute bottom-3 right-3 bg-slate-950/90 text-app-teal text-[11px] font-black uppercase px-2.5 py-1 rounded-lg border border-slate-700/80 tabular-nums">
                    450 PTS
                </span>
            </div>

            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-app-teal bg-app-teal/12 px-2 py-0.5 rounded-md">
                        Vestuário
                    </span>
                    <div className="mt-1.5 text-sm sm:text-base font-extrabold text-app-navy dark:text-white truncate">
                        Camiseta GTI FATEC
                    </div>
                    <p className="text-xs text-app-graytext dark:text-slate-400 mt-0.5 m-0 truncate">
                        Retirada presencial na secretaria da unidade com o voucher.
                    </p>
                </div>

                <span className="shrink-0 px-3.5 py-2 rounded-xl bg-app-teal text-white text-xs font-extrabold">
                    Resgatar
                </span>
            </div>
        </div>

        {/* Linha de resgate idêntica à aba Meus Resgates */}
        <div className="bg-white dark:bg-app-darkcard border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-app-navy dark:text-white bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        RES-8K4M2P9Q
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-app-navy dark:text-white truncate">
                        Camiseta GTI FATEC
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-app-graytext dark:text-slate-400">
                    <span className="font-bold text-app-coral tabular-nums">450 PTS</span>
                    <span>•</span>
                    <span className="tabular-nums">18/11/2026</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-app-teal">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Validado</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
)

/**
 * Réplica fidedigna da Classificação Geral FATEC de RankingSection.tsx.
 */
const RankingPreview: React.FC = () => (
    <div className="w-full max-w-[580px] bg-white dark:bg-app-darkcard border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-app-teal/15 dark:bg-[#112a2e] border border-app-teal/25 text-app-teal flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
                <div className="text-sm sm:text-base font-extrabold text-app-navy dark:text-white tracking-tight">
                    Classificação Geral FATEC
                </div>
                <div className="text-[11px] text-app-graytext dark:text-slate-400 truncate">
                    A barra em cada linha representa o impacto proporcional ao 1º colocado
                </div>
            </div>
        </div>

        <div className="space-y-2.5">
            {RANKING_PREVIEW_ROWS.map((item) => {
                const barWidth = Math.max(8, Math.round((item.points / MAX_RANKING_POINTS) * 100))

                let positionBadge =
                    'bg-slate-100 dark:bg-slate-800 text-app-navy dark:text-slate-200 border-slate-200 dark:border-slate-700'

                if (item.position === 1) {
                    positionBadge =
                        'bg-amber-400/20 text-amber-600 dark:text-amber-300 border-amber-400/40'
                } else if (item.position === 2) {
                    positionBadge =
                        'bg-slate-300/35 dark:bg-slate-700 text-slate-700 dark:text-slate-100 border-slate-400/40'
                } else if (item.position === 3) {
                    positionBadge =
                        'bg-app-coral/20 text-app-coral border-app-coral/40'
                }

                return (
                    <div
                        key={item.position}
                        className={`relative overflow-hidden rounded-xl border bg-slate-50 dark:bg-app-darkbg ${
                            item.isMe
                                ? 'border-app-teal shadow-xs'
                                : 'border-slate-200 dark:border-slate-800'
                        }`}
                    >
                        <div
                            className="absolute inset-y-0 left-0 pointer-events-none bg-slate-200/65 dark:bg-white/[0.06]"
                            style={{ width: `${barWidth}%` }}
                        />

                        <div className="relative z-10 px-3 sm:px-3.5 py-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <span
                                    className={`w-7 h-7 rounded-lg text-[11px] font-black border inline-flex items-center justify-center tabular-nums shrink-0 ${positionBadge}`}
                                >
                                    {item.position}º
                                </span>

                                <img
                                    src={item.avatar}
                                    alt=""
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0 bg-app-teal/15"
                                />

                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs sm:text-sm font-extrabold text-app-navy dark:text-white truncate">
                                            {item.name}
                                        </span>
                                        {item.isMe && (
                                            <span className="bg-app-teal text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                                                Você
                                            </span>
                                        )}
                                    </div>
                                    <span className="block text-[11px] font-semibold text-app-teal truncate">
                                        @{item.nick}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-app-coral bg-app-coral/12 border border-app-coral/25 px-2 py-0.5 rounded-full tabular-nums">
                                    <Flame className="w-3 h-3" />
                                    <span>{item.streak} dias</span>
                                </span>

                                <span className="text-xs sm:text-sm font-black text-app-navy dark:text-white tabular-nums text-right">
                                    {item.points.toLocaleString('pt-BR')}{' '}
                                    <span className="text-[11px] font-bold text-app-teal">pts</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
)

/**
 * Réplica fidedigna de Doar Pontos de DonationsSection.tsx.
 */
const TransferPreview: React.FC = () => (
    <div className="w-full max-w-[520px] bg-white dark:bg-app-darkcard border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <div className="text-sm sm:text-base font-extrabold text-app-navy dark:text-white">
                    Doar Pontos
                </div>
                <div className="text-[11px] text-app-graytext dark:text-slate-400">
                    Pesquise pelo nome ou pelo @ da pessoa para enviar pontos
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-app-darkbg border border-slate-200/70 dark:border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2 shrink-0">
                <Wallet className="w-3.5 h-3.5 text-app-teal" />
                <div className="leading-tight">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-app-graytext dark:text-slate-400">
                        Seu Saldo
                    </span>
                    <span className="text-xs font-black text-app-navy dark:text-white tabular-nums">
                        320 <span className="text-app-teal">pts</span>
                    </span>
                </div>
            </div>
        </div>

        <div className="space-y-1.5">
            <span className="block text-[11px] font-bold text-app-navy dark:text-slate-200">
                Destinatário (Nome ou @)
            </span>
            <div className="bg-slate-50 dark:bg-app-darkbg border border-app-teal/50 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <img
                        src="/avatars/2.webp"
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0 bg-app-teal/15"
                    />
                    <div className="min-w-0">
                        <span className="block text-sm font-bold text-app-navy dark:text-white truncate">
                            Mariana Costa
                        </span>
                        <span className="block text-xs font-medium text-app-teal truncate">
                            @mariana.gti
                        </span>
                    </div>
                </div>
                <span className="rounded-lg bg-app-teal/15 text-app-teal-deep dark:text-app-teal text-xs font-black px-2.5 py-1 tabular-nums shrink-0">
                    +50 pts
                </span>
            </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 rounded-xl p-3 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>Transferência imediata confirmada — taxa R$ 0,00.</span>
        </div>
    </div>
)

const BenefitsShowcaseSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<RewardShowcaseKey>(RewardShowcaseKey.AACC)

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        if (
            event.key !== 'ArrowDown' &&
            event.key !== 'ArrowUp' &&
            event.key !== 'ArrowRight' &&
            event.key !== 'ArrowLeft'
        ) {
            return
        }

        event.preventDefault()
        const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1
        const nextIndex = (index + delta + REWARD_TABS.length) % REWARD_TABS.length
        const nextTab = REWARD_TABS[nextIndex]
        setActiveTab(nextTab.id)
        document.getElementById(`reward-tab-${nextTab.id}`)?.focus()
    }

    return (
        <section
            id="recompensas"
            aria-labelledby="showcase-heading"
            className="bg-white dark:bg-app-landing-dark py-10 sm:py-12 lg:py-16 scroll-mt-20 sm:scroll-mt-24 transition-colors duration-200"
        >
            <div className="w-full lg:max-w-[min(86vw,100rem)] mx-auto px-5 sm:px-8 lg:px-6 space-y-6 lg:space-y-8">
                <LandingSectionHeader
                    id="showcase-heading"
                    tag="Recompensas"
                    tone="teal"
                    title={
                        <>
                            Troque seus pontos no{' '}
                            <span className="text-app-teal-deep dark:text-app-teal">campus.</span>
                        </>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                    {/* Palco visual fidedigno aos templates reais da aplicação */}
                    <div
                        id={`reward-panel-${activeTab}`}
                        role="tabpanel"
                        aria-labelledby={`reward-tab-${activeTab}`}
                        className="order-2 lg:order-1 lg:col-span-7 rounded-2xl bg-[#F5F7F9] dark:bg-app-receipt-dark border border-app-navy/10 dark:border-white/10 p-5 sm:p-8 lg:p-10 min-h-[380px] sm:min-h-[450px] flex items-center justify-center transition-colors duration-200"
                    >
                        <div
                            key={activeTab}
                            aria-hidden="true"
                            className="w-full flex items-center justify-center motion-safe:animate-[hero-rise-in_220ms_cubic-bezier(0.22,1,0.36,1)_both]"
                        >
                            {activeTab === RewardShowcaseKey.AACC && <AaccCertificatePreview />}
                            {activeTab === RewardShowcaseKey.STORE && <StorePreview />}
                            {activeTab === RewardShowcaseKey.RANKING && <RankingPreview />}
                            {activeTab === RewardShowcaseKey.TRANSFER && <TransferPreview />}
                        </div>
                    </div>

                    {/* Seletor editorial limpo com divisórias */}
                    <div
                        role="tablist"
                        aria-label="Opções de recompensas"
                        className="order-1 lg:order-2 lg:col-span-5 divide-y divide-app-navy/10 dark:divide-white/10 border-y border-app-navy/10 dark:border-white/10"
                    >
                        {REWARD_TABS.map((tab, index) => {
                            const isActive = activeTab === tab.id
                            const TabIcon = tab.icon

                            return (
                                <button
                                    key={tab.id}
                                    id={`reward-tab-${tab.id}`}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-controls={`reward-panel-${tab.id}`}
                                    tabIndex={isActive ? 0 : -1}
                                    onClick={() => setActiveTab(tab.id)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className={`group relative w-full text-left py-4 sm:py-5 pl-4 pr-2 min-h-14 flex items-start gap-3.5 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-[-2px] ${
                                        isActive
                                            ? 'text-app-navy dark:text-white'
                                            : 'text-app-navy/70 dark:text-slate-300 hover:text-app-navy dark:hover:text-white'
                                    }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-colors duration-200 ${
                                            isActive
                                                ? 'bg-app-teal-deep dark:bg-app-teal'
                                                : 'bg-transparent group-hover:bg-app-navy/15 dark:group-hover:bg-white/15'
                                        }`}
                                    />

                                    <span
                                        aria-hidden="true"
                                        className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                                            isActive
                                                ? 'bg-app-teal/15 text-app-teal-deep dark:text-app-teal'
                                                : 'bg-[#F5F7F9] dark:bg-white/6 text-slate-500 dark:text-slate-400 group-hover:text-app-navy dark:group-hover:text-slate-200'
                                        }`}
                                    >
                                        <TabIcon className="w-4 h-4" />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <span
                                            className={`block text-[11px] font-extrabold tracking-wide ${
                                                isActive
                                                    ? 'text-app-teal-deep dark:text-app-teal'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}
                                        >
                                            {tab.kicker}
                                        </span>

                                        <div className="mt-0.5 text-sm sm:text-base font-extrabold leading-snug">
                                            {tab.title}
                                        </div>

                                        <p
                                            className={`landing-copy text-xs sm:text-sm leading-relaxed mt-1 m-0 transition-colors duration-150 ${
                                                isActive
                                                    ? 'text-slate-600 dark:text-slate-300'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}
                                        >
                                            {tab.description}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default BenefitsShowcaseSection
