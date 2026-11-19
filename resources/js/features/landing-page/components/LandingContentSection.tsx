import React from 'react'
import { Link } from '@inertiajs/react'
import { ArrowRightIcon } from './LandingMotifs'

export interface LandingContentSectionProps {
    registerHref?: string
}

const SURVEY_NUMBERS = [
    {
        value: '19 de 20',
        label: 'alunos da Fatec Franco da Rocha preferem doar com recompensas',
        toneClass: 'text-app-teal-deep dark:text-app-teal',
    },
    {
        value: '11 de 13',
        label: 'esqueciam de guardar o cupom para a urna física',
        toneClass: 'text-app-coral-heading dark:text-app-coral',
    },
] as const

const LandingContentSection: React.FC<LandingContentSectionProps> = ({
    registerHref = '/register',
}) => {
    return (
        <section className="bg-white dark:bg-app-landing-dark py-10 sm:py-12 lg:py-16 transition-colors duration-200">
            <div className="w-full lg:max-w-[min(86vw,100rem)] mx-auto px-5 sm:px-8 lg:px-6">
                <div className="border-t border-app-navy/10 dark:border-white/10 pt-12 sm:pt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 space-y-4">
                        <h2 className="landing-heading text-[1.75rem] sm:text-4xl font-black tracking-tight leading-[1.14] text-app-navy dark:text-slate-100">
                            Sua próxima nota já apoia a{' '}
                            <span className="text-app-coral-heading dark:text-app-coral">
                                APAE.
                            </span>
                        </h2>

                        <p className="landing-copy text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-[40ch] m-0">
                            Cadastre-se grátis e envie seus cupons de São Paulo sem CPF antes do dia 20.
                        </p>

                        <div className="pt-2">
                            <Link
                                href={registerHref}
                                className="group inline-flex items-center justify-center gap-2 min-h-12 px-7 py-3 rounded-full bg-app-teal-deep hover:bg-[#176155] dark:bg-app-teal dark:hover:bg-app-teal-light text-white dark:text-app-teal-ink text-sm font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2"
                            >
                                <span>Começar grátis</span>
                                <ArrowRightIcon />
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <ul className="divide-y divide-app-navy/10 dark:divide-white/10 border-y border-app-navy/10 dark:border-white/10 list-none">
                            {SURVEY_NUMBERS.map((item) => (
                                <li key={item.value} className="py-4 flex items-baseline gap-4">
                                    <span
                                        className={`text-xl sm:text-2xl font-black tracking-tight tabular-nums shrink-0 min-w-[6.5rem] ${item.toneClass}`}
                                    >
                                        {item.value}
                                    </span>
                                    <span className="text-xs sm:text-sm leading-snug text-slate-600 dark:text-slate-300">
                                        {item.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LandingContentSection
