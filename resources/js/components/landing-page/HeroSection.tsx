import React from 'react';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    QrCode,
    Coins,
    Receipt,
    GraduationCap,
    Heart,
    type LucideIcon,
} from 'lucide-react';

export interface HeroSectionProps {
    registerHref?: string;
    loginHref?: string;
}

interface FloatingChip {
    position: string;
    icon: LucideIcon;
    label: string;
    iconStyle: string;
}

const floatingChips: FloatingChip[] = [
    {
        position: 'top-4 left-0 sm:left-4',
        icon: Coins,
        label: '1 Real = 1 Ponto',
        iconStyle: 'bg-app-teal/15 text-app-teal',
    },
    {
        position: 'top-8 right-0 sm:right-4',
        icon: Receipt,
        label: 'Com ou sem CPF',
        iconStyle: 'bg-app-coral/15 text-app-coral',
    },
    {
        position: 'bottom-6 left-0 sm:left-4',
        icon: GraduationCap,
        label: 'Horas AACC',
        iconStyle: 'bg-app-navy/10 text-app-navy dark:text-app-teal',
    },
    {
        position: 'bottom-4 right-0 sm:right-4',
        icon: Heart,
        label: 'Doação à APAE',
        iconStyle: 'bg-rose-500/15 text-rose-500',
    },
];

const HeroSection: React.FC<HeroSectionProps> = ({
    registerHref = '/register',
    loginHref = '/login',
}) => {
    return (
        <section className="relative py-16 sm:py-20 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Coluna de Texto e Ações */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-2.5">
                            <span className="w-9 h-0.5 bg-app-coral" />
                            <span className="text-xs font-bold tracking-wider uppercase text-app-coral">
                                Grátis · FATEC & APAE
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-app-navy dark:text-white leading-tight">
                            Transforme seus gastos do dia a dia em{' '}
                            <span className="text-app-coral">impacto social</span> na APAE e{' '}
                            <span className="text-app-teal">pontos</span> na FATEC.
                        </h1>

                        <p className="text-base sm:text-lg text-app-graytext dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            A gente transforma a nota fiscal em recompensa:{' '}
                            <strong className="text-app-navy dark:text-white font-semibold">
                                horas AACC, apoio direto à APAE e prêmios no campus
                            </strong>
                            .<br className="hidden sm:inline" /> Sem mudar nada na sua rotina, sem custo nenhum.
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-2">
                            <Link
                                href={registerHref}
                                className="px-6 py-3.5 rounded-xl bg-app-teal hover:brightness-95 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <span>Começar Gratuitamente</span>
                                <ArrowRight size={16} />
                            </Link>

                            <Link
                                href={loginHref}
                                className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-app-navy dark:text-gray-200 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                            >
                                Já Tenho Conta
                            </Link>
                        </div>

                        <div className="text-xs text-app-graytext dark:text-gray-400">
                            Válido para cupons com ou sem CPF emitidos no estado de SP.
                        </div>
                    </div>

                    {/* Coluna Visual com QR Code e Chips Flutuantes Orbitando */}
                    <div className="lg:col-span-5 flex justify-center items-center">
                        <div className="relative flex justify-center items-center w-full max-w-xs sm:max-w-md h-72 sm:h-80 mx-auto select-none">

                            {/* Círculo Central */}
                            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center relative shadow-inner">
                                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white dark:bg-slate-900 shadow-md flex flex-col items-center justify-center text-center p-2.5 sm:p-4">
                                    <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-app-teal/15 text-app-teal flex items-center justify-center mb-1 sm:mb-1.5">
                                        <QrCode size={20} className="sm:hidden" />
                                        <QrCode size={24} className="hidden sm:block" />
                                    </div>
                                    <span className="text-[11px] sm:text-xs font-bold text-app-navy dark:text-white">Escaneou</span>
                                    <span className="text-[11px] sm:text-xs text-app-coral font-bold">Pontuou</span>
                                </div>
                            </div>

                            {/* Chips que orbitam o círculo em todas as telas de forma proporcional */}
                            {floatingChips.map((chip) => {
                                const IconComponent = chip.icon;

                                return (
                                    <div
                                        key={chip.label}
                                        className={`absolute ${chip.position} bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 sm:gap-2.5 z-10`}
                                    >
                                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${chip.iconStyle} flex items-center justify-center shrink-0`}>
                                            <IconComponent size={13} className="sm:hidden" />
                                            <IconComponent size={16} className="hidden sm:block" />
                                        </div>
                                        <span className="text-[11px] sm:text-xs font-bold text-app-navy dark:text-white whitespace-nowrap">
                                            {chip.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HeroSection;