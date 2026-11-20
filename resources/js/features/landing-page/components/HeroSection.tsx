import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowDown } from 'lucide-react';
import { smoothScrollToHash } from '@/components/layout/smoothScroll';
import { ArrowRightIcon, HeartIcon, QrCodeGraphic, ReceiptZigzagEdge, StarIcon } from './LandingMotifs';

export interface HeroSectionProps {
    registerHref?: string;
    loginHref?: string;
}

const HERO_HIGHLIGHTS: readonly React.ReactNode[] = [
    <strong key="rate" className="font-extrabold text-app-navy dark:text-slate-100">
        R$ 1 = 1 ponto
    </strong>,
    <strong key="apae" className="font-extrabold text-app-navy dark:text-slate-100">
        100% APAE
    </strong>,
    <span key="validity">
        Pontos válidos por{' '}
        <strong className="font-extrabold text-app-navy dark:text-slate-100">
            <span data-points-expiration-months="6">6</span> meses
        </strong>
    </span>,
    <strong key="window" className="font-extrabold text-app-navy dark:text-slate-100">
        Envio até dia 20 do próximo mês
    </strong>,
]

const HeroSection: React.FC<HeroSectionProps> = ({
    registerHref = '/register',
    loginHref = '/login',
}) => {
    const stageRef = useRef<HTMLDivElement | null>(null);
    const [stageInView, setStageInView] = useState(true);

    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => setStageInView(entry.isIntersecting),
            { threshold: 0.05 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            aria-labelledby="hero-heading"
            className="relative bg-white dark:bg-app-landing-dark pt-16 sm:pt-18 lg:pt-20 transition-colors duration-200"
        >
            <div className="lg:landscape:min-h-[min(calc(100dvh-5rem),54rem)] w-full xl:max-w-[min(86vw,100rem)] mx-auto px-5 sm:px-8 lg:px-10 xl:px-6 py-8 sm:py-10 md:py-12 lg:py-14 flex items-center">
                <div className="w-full grid grid-cols-1 md:grid-cols-[1.25fr_0.9fr] lg:grid-cols-[7fr_5fr] gap-9 md:gap-8 lg:gap-12 items-center">
                    {/* Coluna de Texto e Ações */}
                    <div className="flex flex-col items-start gap-4 sm:gap-5 lg:gap-[1.35rem] min-w-0">
                        <h1
                            id="hero-heading"
                            className="hero-rise-1 m-0 text-left text-[2.125rem] sm:text-[2.75rem] md:text-[clamp(2.75rem,4.7vw,3.4rem)] lg:text-[clamp(3rem,4.5vw,5.15rem)] font-black leading-[1.15] tracking-tight text-app-navy dark:text-slate-100 transition-colors duration-200"
                        >
                            Transforme seus gastos em{' '}
                            <span className="text-app-coral-heading dark:text-app-coral transition-colors duration-200">
                                impacto social
                            </span>{' '}
                            na APAE e{' '}
                            <span className="text-app-teal-deep dark:text-app-teal transition-colors duration-200">
                                pontos
                            </span>{' '}
                            na FATEC.
                        </h1>

                        <p className="hero-rise-2 m-0 max-w-[44ch] text-[0.9375rem] sm:text-base lg:text-[clamp(1rem,1.15vw,1.22rem)] leading-[1.6] text-slate-600 dark:text-slate-300 transition-colors duration-200">
                            Escaneie suas notas fiscais de SP sem CPF direto pelo navegador, de graça.
                        </p>

                        <div className="hero-rise-3 flex flex-wrap items-center gap-x-3 sm:gap-x-4 lg:gap-x-5 gap-y-2 pt-1">
                            <Link
                                href={registerHref}
                                className="group inline-flex items-center justify-center gap-2 min-h-12 lg:min-h-[3.25rem] xl:min-h-[3.5rem] px-5 sm:px-6 lg:px-7 xl:px-8 py-3 rounded-full bg-app-teal-deep hover:bg-[#176155] dark:bg-app-teal dark:hover:bg-app-teal-light text-white dark:text-app-teal-ink text-sm lg:text-[0.95rem] xl:text-base font-bold shadow-sm transition-[background-color,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2"
                            >
                                <span>Começar grátis</span>
                                <ArrowRightIcon />
                            </Link>

                            <Link
                                href={loginHref}
                                className="inline-flex items-center justify-center min-h-12 lg:min-h-[3.25rem] xl:min-h-[3.5rem] px-4 sm:px-5 lg:px-6 py-3 rounded-full bg-transparent hover:bg-app-bg dark:hover:bg-app-elevated-dark text-slate-700 dark:text-slate-200 hover:text-app-teal-deep dark:hover:text-app-teal text-sm lg:text-[0.95rem] xl:text-base font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2"
                            >
                                Já tenho conta
                            </Link>
                        </div>
                    </div>

                    {/* Coluna Visual — Cupom Geométrico + Dois Selos */}
                    <div
                        ref={stageRef}
                        data-in-view={stageInView ? 'true' : 'false'}
                        aria-hidden="true"
                        className="hero-receipt-stage relative max-w-[300px] sm:max-w-[360px] md:max-w-[310px] lg:max-w-[min(100%,34rem)] mx-auto md:ml-auto md:mr-0 w-full pt-7 pb-5 sm:pt-9 sm:pb-7 flex justify-center min-w-0"
                    >
                        <div className="paper-receipt w-[192px] sm:w-[236px] md:w-[232px] lg:w-[clamp(260px,22vw,350px)] motion-reduce:-rotate-2 relative">
                            <div className="paper-receipt-inner w-full flex flex-col transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]">
                            <div className="w-full bg-app-teal dark:bg-app-teal-deep border border-b-0 border-app-teal-deep/20 dark:border-white/15 rounded-t-[18px] lg:rounded-t-[22px] px-[0.9rem] pt-[0.95rem] pb-[1.35rem] sm:px-5 sm:pt-[1.35rem] sm:pb-7 lg:px-[1.6rem] lg:pt-[1.65rem] lg:pb-[2.1rem]">
                            <div
                                className="flex justify-between items-center pb-[0.55rem] sm:pb-3 lg:pb-4 border-b border-dashed border-white/35 mb-[0.65rem] sm:mb-[0.9rem] lg:mb-4"
                                aria-hidden="true"
                            >
                                <span
                                    className="h-[9px] lg:h-[11px] rounded-full bg-white/75 transition-colors duration-200"
                                    style={{ width: '44%' }}
                                />
                                <span
                                    className="h-[7px] lg:h-[9px] rounded-full bg-white/45 transition-colors duration-200"
                                    style={{ width: '24%' }}
                                />
                            </div>

                            <div
                                className="flex flex-col gap-2 lg:gap-2.5 mb-[0.85rem] sm:mb-[1.1rem] lg:mb-5"
                                aria-hidden="true"
                            >
                                <span
                                    className="h-[7px] lg:h-[9px] rounded-full bg-white/45 transition-colors duration-200"
                                    style={{ width: '78%' }}
                                />
                                <span
                                    className="h-[7px] lg:h-[9px] rounded-full bg-white/45 transition-colors duration-200"
                                    style={{ width: '56%' }}
                                />
                            </div>

                            <div className="paper-qr-row relative overflow-hidden flex items-center justify-center p-[0.72rem] sm:p-[0.95rem] lg:p-5 bg-app-teal-deep/45 dark:bg-[#14554a]/70 rounded-[14px] lg:rounded-[18px] border border-white/25 transition-transform duration-200">
                                <QrCodeGraphic
                                    className="w-[72px] h-[72px] sm:w-[92px] sm:h-[92px] lg:w-[clamp(92px,7.6vw,138px)] lg:h-[clamp(92px,7.6vw,138px)] block"
                                    cornersClassName="qr-corners text-white"
                                    modulesClassName="fill-white transition-colors duration-200"
                                />
                            </div>
                            </div>

                            <ReceiptZigzagEdge
                                className="w-full h-[11px] block -mt-px"
                                fillClassName="fill-app-teal dark:fill-app-teal-deep transition-[fill] duration-200"
                            />
                            </div>
                        </div>

                        <div className="float-badge left absolute left-0 bottom-0 sm:bottom-[0.35rem] motion-reduce:rotate-[1.5deg] bg-white dark:bg-app-elevated-dark rounded-xl sm:rounded-[14px] lg:rounded-2xl px-[0.7rem] py-[0.45rem] sm:px-[0.95rem] sm:py-[0.6rem] xl:px-5 xl:py-3 shadow-sm border border-app-navy/10 dark:border-slate-200/14 flex items-center gap-[0.45rem] sm:gap-[0.6rem] xl:gap-3 transition-transform duration-200">
                            <div
                                className="badge-icon w-7 h-7 sm:w-8 sm:h-8 xl:w-9 xl:h-9 rounded-lg sm:rounded-[9px] flex items-center justify-center flex-none bg-app-coral/14 text-app-coral-deep dark:text-app-coral transition-transform duration-200"
                                aria-hidden="true"
                            >
                                <HeartIcon size={17} />
                            </div>
                            <strong className="block text-[0.76rem] sm:text-[0.82rem] xl:text-[0.92rem] font-extrabold text-app-navy dark:text-slate-50 whitespace-nowrap">
                                Doação APAE
                            </strong>
                        </div>

                        <div className="float-badge right absolute right-0 top-[1.15rem] sm:top-[2.2rem] lg:top-[2.6rem] motion-reduce:rotate-2 bg-white dark:bg-app-elevated-dark rounded-xl sm:rounded-[14px] lg:rounded-2xl px-[0.7rem] py-[0.45rem] sm:px-[0.95rem] sm:py-[0.6rem] xl:px-5 xl:py-3 shadow-sm border border-app-navy/10 dark:border-slate-200/14 flex items-center gap-[0.45rem] sm:gap-[0.6rem] xl:gap-3 transition-transform duration-200">
                            <div
                                className="badge-icon w-7 h-7 sm:w-8 sm:h-8 xl:w-9 xl:h-9 rounded-lg sm:rounded-[9px] flex items-center justify-center flex-none bg-app-teal/16 text-app-teal-deep dark:text-app-teal transition-transform duration-200"
                                aria-hidden="true"
                            >
                                <StarIcon size={17} />
                            </div>
                            <strong className="block text-[0.76rem] sm:text-[0.82rem] xl:text-[0.92rem] font-extrabold text-app-navy dark:text-slate-50 whitespace-nowrap">
                                +42 pontos
                            </strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rodapé discreto na base do Hero */}
            <div className="w-full xl:max-w-[min(86vw,100rem)] mx-auto px-5 sm:px-8 lg:px-10 xl:px-6 pb-6 sm:pb-8">
                <div className="border-t border-app-navy/8 dark:border-white/10 pt-4 sm:pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 list-none text-xs sm:text-[13px] text-slate-600 dark:text-slate-300">
                        {HERO_HIGHLIGHTS.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>

                    <a
                        href="#como-funciona"
                        onClick={(e) => smoothScrollToHash(e, '#como-funciona')}
                        className="group inline-flex items-center gap-1.5 min-h-11 w-fit text-xs sm:text-[13px] font-bold text-app-teal-deep dark:text-app-teal hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2 rounded-md"
                    >
                        <span>Como funciona</span>
                        <ArrowDown
                            size={15}
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:translate-y-0.5"
                        />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
