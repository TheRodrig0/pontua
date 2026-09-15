import React, { useState } from 'react';
import { Link } from "@inertiajs/react";
import { Menu, X } from "lucide-react";
import LogoPontua from "./LogoPontua";
import ThemeToggle from "./ThemeToggle";

export interface NavItem {
    label: string;
    href: string;
    active?: boolean;
}

export interface HeaderProps {
    variant?: 'landing' | 'simple';
    navItems?: NavItem[];
    showLogin?: boolean;
    showRegister?: boolean;
    registerText?: string;
    registerHref?: string;
    loginHref?: string;
}

const defaultLandingNav: NavItem[] = [
    { label: "Como funciona", href: "#como-funciona", active: true },
    { label: "O que você ganha", href: "#ganha" },
    { label: "Transparência", href: "#transparencia" },
    { label: "Perguntas", href: "#faq" },
];

const Header: React.FC<HeaderProps> = ({
    variant = 'landing',
    navItems = defaultLandingNav,
    showLogin = true,
    showRegister = true,
    registerText = "Criar Conta",
    registerHref = "/register",
    loginHref = "/login",
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isLanding = variant === 'landing';
    const hasNavItems = navItems.length > 0;
    const shouldShowNav = isLanding && hasNavItems;
    const isMenuOpen = isMobileMenuOpen;

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-app-bg/90 dark:bg-app-darkbg/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">

                {/* 1. Lado Esquerdo: Logo */}
                <Link href="/" className="shrink-0" onClick={handleLinkClick}>
                    <LogoPontua iconSize={30} textClassName="text-base sm:text-xl font-extrabold tracking-tight text-app-navy dark:text-white" />
                </Link>

                {/* 2. Centro: Navegação Desktop (apenas telas grandes >= lg) */}
                {shouldShowNav && (
                    <nav className="hidden lg:flex items-center gap-8 px-4">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`text-sm font-semibold whitespace-nowrap transition-colors ${item.active
                                    ? "text-app-teal"
                                    : "text-app-navy dark:text-gray-300 hover:text-app-teal"
                                    }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                )}

                {/* 3. Lado Direito: Ações & Botão Mobile */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <ThemeToggle />

                    {showLogin && (
                        <Link
                            href={loginHref}
                            className="hidden sm:inline-block text-sm font-bold text-app-navy dark:text-gray-200 hover:text-app-teal px-2 py-1"
                        >
                            Entrar
                        </Link>
                    )}

                    {showRegister && (
                        <Link
                            href={registerHref}
                            className="bg-app-teal hover:brightness-95 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
                        >
                            {registerText}
                        </Link>
                    )}

                    {/* Botão de Menu para Celular e Tablet (< lg) */}
                    {shouldShowNav && (
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                            className="lg:hidden p-2 rounded-xl text-app-navy dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Menu Dropdown para Tablet e Mobile (< lg) */}
            {isMenuOpen && shouldShowNav && (
                <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-app-darkbg/95 backdrop-blur-md px-6 py-5 shadow-lg">
                    <nav className="flex flex-col gap-3">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={handleLinkClick}
                                className={`text-base font-semibold py-2 px-3 rounded-lg transition-colors ${item.active
                                    ? "text-app-teal bg-app-teal/10"
                                    : "text-app-navy dark:text-gray-200 hover:text-app-teal hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {showLogin && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 sm:hidden">
                            <Link
                                href={loginHref}
                                onClick={handleLinkClick}
                                className="block text-center text-sm font-bold text-app-navy dark:text-gray-200 hover:text-app-teal py-2"
                            >
                                Já tenho conta (Entrar)
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
