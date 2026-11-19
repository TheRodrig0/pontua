import React from 'react'
import { Link } from '@inertiajs/react'
import LogoPontua from './LogoPontua'
import { smoothScrollToHash, smoothScrollToTopIfHome } from './smoothScroll'

const FOOTER_ANCHORS = [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Recompensas', href: '#recompensas' },
    { label: 'Dúvidas', href: '#duvidas' },
] as const

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="mt-auto bg-[#18202c] dark:bg-[#12151a] text-slate-300 border-t border-white/10 py-8 text-xs">
            <div className="w-full lg:max-w-[min(86vw,100rem)] mx-auto px-5 sm:px-8 lg:px-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <Link
                        href="/"
                        onClick={(e) => smoothScrollToTopIfHome(e)}
                        className="inline-flex items-center min-h-11 w-fit rounded-md focus-visible:outline-2 focus-visible:outline-app-teal focus-visible:outline-offset-2"
                    >
                        <LogoPontua
                            iconSize={28}
                            textClassName="text-base font-black tracking-tight text-white"
                        />
                    </Link>

                    <nav
                        aria-label="Links do rodapé"
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-[13px]"
                    >
                        {FOOTER_ANCHORS.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={(e) => smoothScrollToHash(e, item.href)}
                                className="min-h-11 inline-flex items-center px-1.5 text-slate-300 hover:text-app-teal transition-colors rounded-md focus-visible:outline-2 focus-visible:outline-app-teal focus-visible:outline-offset-2"
                            >
                                {item.label}
                            </a>
                        ))}

                        <Link
                            href="/login"
                            className="min-h-11 inline-flex items-center px-1.5 text-slate-300 hover:text-app-teal transition-colors rounded-md focus-visible:outline-2 focus-visible:outline-app-teal focus-visible:outline-offset-2"
                        >
                            Entrar
                        </Link>

                        <Link
                            href="/register"
                            className="min-h-11 inline-flex items-center px-1.5 font-semibold text-app-teal hover:text-app-teal-light transition-colors rounded-md focus-visible:outline-2 focus-visible:outline-app-teal focus-visible:outline-offset-2"
                        >
                            Criar Conta
                        </Link>
                    </nav>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-slate-400 text-xs">
                    <p className="m-0">
                        © {currentYear} PONTUA • Fatec Franco da Rocha &amp; APAE.
                    </p>

                    <a
                        href="https://github.com/TheRodrig0/pontua"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center min-h-11 px-1.5 text-slate-300 hover:text-app-teal transition-colors rounded-md focus-visible:outline-2 focus-visible:outline-app-teal focus-visible:outline-offset-2"
                    >
                        Código aberto no GitHub
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
