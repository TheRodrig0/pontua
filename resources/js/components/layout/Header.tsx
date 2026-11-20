import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import LogoPontua from './LogoPontua';
import ThemeToggle from './ThemeToggle';
import { smoothScrollToHash, smoothScrollToTopIfHome } from './smoothScroll';

const navItems = [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Recompensas', href: '#recompensas' },
    { label: 'Dúvidas', href: '#duvidas' },
];

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeHref, setActiveHref] = useState<string | null>(null);
    const drawerRef = useRef<HTMLDivElement>(null);
    const menuBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        let rafId = 0;
        let lastScrolled = false;
        let lastActiveHref: string | null = null;
        let sectionBounds: { href: string; top: number; bottom: number }[] = [];

        const measureSections = () => {
            sectionBounds = navItems
                .map((item) => {
                    const el = document.getElementById(item.href.slice(1));
                    if (!el) return null;
                    const top = el.offsetTop;
                    return { href: item.href, top, bottom: top + el.offsetHeight };
                })
                .filter((entry): entry is { href: string; top: number; bottom: number } => entry !== null);
        };

        const updateHeaderState = () => {
            rafId = 0;
            const y = window.scrollY;
            const nextScrolled = y > 10;
            if (nextScrolled !== lastScrolled) {
                lastScrolled = nextScrolled;
                setIsScrolled(nextScrolled);
            }

            let matched: string | null = null;
            if (y >= 180) {
                const probeY = y + 140;
                for (const section of sectionBounds) {
                    if (probeY >= section.top && probeY < section.bottom) {
                        matched = section.href;
                        break;
                    }
                }
            }

            if (matched !== lastActiveHref) {
                lastActiveHref = matched;
                setActiveHref(matched);
            }
        };

        const onScroll = () => {
            if (!rafId) {
                rafId = window.requestAnimationFrame(updateHeaderState);
            }
        };

        const onResize = () => {
            measureSections();
            onScroll();
        };

        measureSections();
        updateHeaderState();

        const resizeObserver = new ResizeObserver(measureSections);
        resizeObserver.observe(document.body);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        return () => {
            if (rafId) window.cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
                menuBtnRef.current?.focus();
            }
        };

        const onClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                drawerRef.current &&
                !drawerRef.current.contains(target) &&
                !menuBtnRef.current?.contains(target)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('click', onClickOutside);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('click', onClickOutside);
        };
    }, [isMobileMenuOpen]);

    const handleNavClick = (href: string | null) => {
        setActiveHref(href);
        setIsMobileMenuOpen(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 w-full z-50 bg-white dark:bg-app-landing-dark transition-[background-color,box-shadow] duration-200 ${
                isScrolled
                    ? 'shadow-[0_4px_20px_-10px_rgba(39,49,66,0.14)] dark:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.45)]'
                    : ''
            }`}
        >
            <div className="w-full lg:max-w-[min(86vw,100rem)] mx-auto px-5 sm:px-8 lg:px-6 h-16 sm:h-18 lg:h-20 flex items-center justify-between">
                <Link
                    href="/"
                    className="shrink-0 focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2 rounded-md"
                    onClick={(e) => smoothScrollToTopIfHome(e, () => handleNavClick(null))}
                >
                    <LogoPontua
                        iconSize={48}
                        textClassName="text-2xl sm:text-[1.7rem] font-extrabold tracking-tight text-app-navy dark:text-white"
                    />
                </Link>

                <nav className="hidden lg:flex items-center gap-8 px-4" aria-label="Navegação principal">
                    {navItems.map((item) => {
                        const isActive = activeHref === item.href;

                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                aria-current={isActive ? 'location' : undefined}
                                onClick={(e) =>
                                    smoothScrollToHash(e, item.href, () => handleNavClick(item.href))
                                }
                                className={`text-sm font-semibold whitespace-nowrap transition-colors duration-150 px-2.5 py-1.5 rounded-lg focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2 ${
                                    isActive
                                        ? 'text-app-teal-deep dark:text-app-teal'
                                        : 'text-app-navy dark:text-gray-300 hover:text-app-teal-deep dark:hover:text-app-teal'
                                }`}
                            >
                                {item.label}
                            </a>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-1 sm:gap-4 shrink-0">
                    <ThemeToggle className="min-w-11 min-h-11 inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2" />

                    <Link
                        href="/login"
                        className="hidden sm:inline-flex items-center min-h-11 text-sm font-bold text-app-navy dark:text-gray-200 hover:text-app-teal-deep dark:hover:text-app-teal px-3 py-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2 rounded-md"
                    >
                        Entrar
                    </Link>

                    <Link
                        href="/register"
                        className="hidden sm:inline-flex items-center justify-center min-h-11 bg-app-teal-deep hover:bg-[#176155] dark:bg-app-teal dark:hover:bg-app-teal-light text-white dark:text-app-teal-ink text-sm font-bold px-6 py-2 rounded-full shadow-xs hover:shadow-md transition-[background-color,box-shadow] duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2"
                    >
                        Criar Conta
                    </Link>

                    <button
                        ref={menuBtnRef}
                        type="button"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-drawer"
                        className="lg:hidden min-w-11 min-h-11 p-2 rounded-xl text-app-navy dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 inline-flex items-center justify-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <line
                                x1="4"
                                x2="20"
                                y1="12"
                                y2="12"
                                className={`origin-center transition-transform duration-200 ${
                                    isMobileMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5'
                                }`}
                            />
                            <line
                                x1="4"
                                x2="20"
                                y1="12"
                                y2="12"
                                className={`origin-center transition-[opacity,transform] duration-150 ${
                                    isMobileMenuOpen ? 'opacity-0 scale-x-20' : ''
                                }`}
                            />
                            <line
                                x1="4"
                                x2="20"
                                y1="12"
                                y2="12"
                                className={`origin-center transition-transform duration-200 ${
                                    isMobileMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5'
                                }`}
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div
                    id="mobile-drawer"
                    ref={drawerRef}
                    className="lg:hidden border-t border-slate-200/80 dark:border-app-elevated-dark bg-white dark:bg-app-landing-dark px-5 sm:px-6 py-5 shadow-lg"
                >
                    <nav className="flex flex-col gap-2" aria-label="Navegação mobile">
                        {navItems.map((item) => {
                            const isActive = activeHref === item.href;

                            return (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    aria-current={isActive ? 'location' : undefined}
                                    onClick={(e) =>
                                        smoothScrollToHash(e, item.href, () => handleNavClick(item.href))
                                    }
                                    className={`text-base font-semibold min-h-11 flex items-center py-2 px-3 rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2 ${
                                        isActive
                                            ? 'text-app-teal-deep dark:text-app-teal'
                                            : 'text-app-navy dark:text-gray-300 hover:text-app-teal-deep dark:hover:text-app-teal'
                                    }`}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-app-elevated-dark flex flex-col gap-2 sm:hidden">
                        <Link
                            href="/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="min-h-11 flex items-center justify-center rounded-full bg-app-teal-deep hover:bg-[#176155] dark:bg-app-teal dark:hover:bg-app-teal-light text-white dark:text-app-teal-ink text-sm font-bold py-2.5 px-6 shadow-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2"
                        >
                            Criar Conta
                        </Link>
                        <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="min-h-11 flex items-center justify-center text-sm font-bold text-app-navy dark:text-gray-200 hover:text-app-teal-deep dark:hover:text-app-teal py-2 rounded-lg focus-visible:outline-2 focus-visible:outline-app-teal-deep dark:focus-visible:outline-app-teal focus-visible:outline-offset-2"
                        >
                            Já tenho conta (Entrar)
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
