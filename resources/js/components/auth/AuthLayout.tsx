import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { PontuaLogoIcon } from '@/components/LogoPontua';

interface AuthLayoutProps {
    currentPage: 'login' | 'register' | 'forgot-password';
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    currentPage,
    children,
}) => {
    const { isDark, toggleTheme } = useTheme();

    const getSectionInfo = () => {
        switch (currentPage) {
            case 'register':
                return {
                    tag: 'Cadastro',
                    title: 'Criar conta',
                    subtitle: 'Cadastre-se para participar e pontuar no PONTUA.',
                    headTitle: 'Criar Conta',
                };
            case 'forgot-password':
                return {
                    tag: 'Recuperação',
                    title: 'Recuperar senha',
                    subtitle: 'Digite seu e-mail cadastrado para redefinir sua senha.',
                    headTitle: 'Recuperar Senha',
                };
            case 'login':
            default:
                return {
                    tag: 'Acesso',
                    title: 'Entrar na conta',
                    subtitle: 'Digite seus dados para acessar a plataforma.',
                    headTitle: 'Entrar na Conta',
                };
        }
    };

    const info = getSectionInfo();

    return (
        <div className="min-h-screen flex flex-col bg-[#eff3f6] dark:bg-[#111827] text-[#3b475c] dark:text-gray-100 transition-colors duration-300">
            <Head title={`${info.headTitle} - PONTUA`} />

            {/* ===================== HEADER PONTUA ===================== */}
            <header className="sticky top-0 z-50 bg-[#eff3f6]/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-[#dbe3ec] dark:border-gray-800 transition-colors">
                <div className="max-w-[1140px] mx-auto px-4 sm:px-6 md:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
                    {/* Logo PONTUA (clicar volta para a Home / LandingPage) */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none shrink-0 hover:opacity-90 transition-opacity"
                        title="PONTUA - Início"
                    >
                        <PontuaLogoIcon size={36} className="shadow-[0_3px_10px_rgba(75,185,166,0.35)]" />
                        <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#3b475c] dark:text-white">
                            PONTUA<span className="text-[#ea7349]">.</span>
                        </span>
                    </Link>

                    {/* Ações da Direita (Tema + Alternar Login / Cadastro) */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-[#7a889b] hover:text-[#3b475c] dark:text-gray-400 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
                            aria-label="Alternar tema"
                        >
                            {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
                        </button>

                        {currentPage === 'login' ? (
                            <Link
                                href="/register"
                                className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-[#4bb9a6] hover:bg-[#3aa895] text-white text-xs sm:text-[13px] font-bold shadow-[0_3px_12px_rgba(75,185,166,0.3)] transition-all cursor-pointer whitespace-nowrap shrink-0 text-center"
                            >
                                Criar Conta
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-[#4bb9a6] hover:bg-[#3aa895] text-white text-xs sm:text-[13px] font-bold shadow-[0_3px_12px_rgba(75,185,166,0.3)] transition-all cursor-pointer whitespace-nowrap shrink-0 text-center"
                            >
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* ===================== O MEIO (FOCO TOTAL NO FORMULÁRIO) ===================== */}
            <main className="flex-1 max-w-[1140px] w-full mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 flex flex-col items-center justify-center">
                {/* Cabeçalho com etiqueta e título */}
                <div className="text-center max-w-md mx-auto mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="w-6 h-0.5 bg-[#ea7349]" />
                        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#ea7349]">
                            {info.tag}
                        </span>
                        <span className="w-6 h-0.5 bg-[#ea7349]" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3b475c] dark:text-white tracking-tight mb-2">
                        {info.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-[#7a889b] dark:text-gray-400 font-normal leading-relaxed">
                        {info.subtitle}
                    </p>
                </div>

                {/* Formulário Centralizado */}
                <div className="w-full max-w-[420px] sm:max-w-[460px]">
                    {children}
                </div>
            </main>

            {/* ===================== FOOTER PONTUA ===================== */}
            <footer className="mt-auto bg-[#242c3b] dark:bg-[#0f1520] text-white/80 py-8 sm:py-10 text-xs">
                <div className="max-w-[1140px] mx-auto px-5 sm:px-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 cursor-pointer select-none hover:opacity-90 transition-opacity"
                        >
                            <PontuaLogoIcon size={30} />
                            <span className="text-base font-extrabold text-white">
                                PONTUA<span className="text-[#ea7349]">.</span>
                            </span>
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[13px] text-white/70">
                            <Link
                                href="/login"
                                className="hover:text-[#4bb9a6] transition-colors cursor-pointer"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/register"
                                className="hover:text-[#4bb9a6] transition-colors cursor-pointer"
                            >
                                Criar Conta
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/50 text-[11.5px]">
                        <p>© {new Date().getFullYear()} PONTUA • 1 Real na nota = 1 Ponto na FATEC • Apoio direto à APAE.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AuthLayout;
