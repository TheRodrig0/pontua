import React from 'react';
import { Head, Link } from '@inertiajs/react';
import LogoPontua from '@/components/LogoPontua';
import ThemeToggle from '@/components/ThemeToggle';

interface AuthLayoutProps {
    currentPage: 'login' | 'register' | 'forgot-password';
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    currentPage,
    children,
}) => {
    const isRegister = currentPage === 'register';
    const isForgotPassword = currentPage === 'forgot-password';

    let info = {
        tag: 'Acesso',
        title: 'Entrar na conta',
        subtitle: 'Digite seus dados para acessar a plataforma.',
        headTitle: 'Entrar na Conta',
    };

    if (isRegister) {
        info = {
            tag: 'Cadastro',
            title: 'Criar conta',
            subtitle: 'Cadastre-se para participar e pontuar no PONTUA.',
            headTitle: 'Criar Conta',
        };
    } else if (isForgotPassword) {
        info = {
            tag: 'Recuperação',
            title: 'Recuperar senha',
            subtitle: 'Digite seu e-mail cadastrado para redefinir sua senha.',
            headTitle: 'Recuperar Senha',
        };
    }

    return (
        <div className="min-h-screen flex flex-col bg-app-bg dark:bg-app-darkbg text-app-navy dark:text-gray-100 transition-colors duration-300">
            <Head title={`${info.headTitle} - PONTUA`} />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-app-bg/90 dark:bg-app-darkbg/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="shrink-0 hover:opacity-90 transition-opacity"
                        title="PONTUA - Início"
                    >
                        <LogoPontua />
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <ThemeToggle />

                        {currentPage === 'login' ? (
                            <Link
                                href="/register"
                                className="bg-app-teal hover:brightness-95 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
                            >
                                Criar Conta
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-app-teal hover:brightness-95 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
                            >
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
                <div className="text-center max-w-md mx-auto mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="w-6 h-0.5 bg-app-coral" />
                        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-app-coral">
                            {info.tag}
                        </span>
                        <span className="w-6 h-0.5 bg-app-coral" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-app-navy dark:text-white tracking-tight mb-2">
                        {info.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-app-graytext dark:text-gray-400 font-normal leading-relaxed">
                        {info.subtitle}
                    </p>
                </div>

                <div className="w-full max-w-[420px] sm:max-w-[460px]">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto bg-slate-900 dark:bg-[#0f1520] text-white/80 py-8 sm:py-10 text-xs border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                        <Link
                            href="/"
                            className="hover:opacity-90 transition-opacity"
                        >
                            <LogoPontua
                                iconSize={28}
                                textClassName="text-base font-extrabold text-white"
                            />
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-[13px] text-white/70">
                            <Link
                                href="/login"
                                className="hover:text-app-teal transition-colors"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/register"
                                className="hover:text-app-teal transition-colors"
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
