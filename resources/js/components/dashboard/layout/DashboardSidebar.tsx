import React, { useEffect, useRef, useState } from 'react';
import { LogOut, Sparkles, X } from 'lucide-react';
import { PontuaLogoIcon } from '@/components/LogoPontua';
import ThemeToggle from '@/components/ThemeToggle';
import type { DashboardTab, UserProfile } from '@/types/dashboard';

export interface NavItemConfig {
    id: DashboardTab;
    label: string;
    icon: React.FC<{ className?: string }>;
}

interface DashboardSidebarProps {
    activeTab: DashboardTab;
    isSidebarCollapsed: boolean;
    isMobileSidebarOpen: boolean;
    visibleNavItems: NavItemConfig[];
    profile: UserProfile | null;
    displayUserName: string;
    displayBalance: number;
    onSelectTab: (tab: DashboardTab) => void;
    onCloseMobileSidebar: () => void;
    onLogout: () => void;
}

function getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);
    const isEmpty = parts.length === 0;
    if (isEmpty) {
        return 'U';
    }
    const isSingleWord = parts.length === 1;
    if (isSingleWord) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    activeTab,
    isSidebarCollapsed,
    isMobileSidebarOpen,
    visibleNavItems,
    profile,
    displayUserName,
    displayBalance,
    onSelectTab,
    onCloseMobileSidebar,
    onLogout,
}) => {
    const navRef = useRef<HTMLElement>(null);
    const [pillStyle, setPillStyle] = useState<{ top: number; height: number; opacity: number }>({
        top: 0,
        height: 0,
        opacity: 0,
    });

    useEffect(() => {
        if (!navRef.current) return;
        const activeButton = navRef.current.querySelector<HTMLButtonElement>('[data-active="true"]');
        if (activeButton) {
            setPillStyle({
                top: activeButton.offsetTop,
                height: activeButton.offsetHeight,
                opacity: 1,
            });
        } else {
            setPillStyle((prev) => ({ ...prev, opacity: 0 }));
        }
    }, [activeTab, visibleNavItems, isSidebarCollapsed]);

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity duration-300 ease-in-out ${
                    isMobileSidebarOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
                onClick={onCloseMobileSidebar}
                aria-hidden="true"
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-white dark:bg-[#151e2e] border-r border-slate-200/80 dark:border-slate-800/90 transition-[transform,width] duration-300 ease-in-out ${
                    isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
                } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
            >
                <div>
                    <div className="h-18 px-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <PontuaLogoIcon size={36} />
                            <div
                                className={`leading-tight overflow-hidden transition-[opacity,max-width] duration-300 ease-in-out ${
                                    isSidebarCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-40 opacity-100'
                                }`}
                            >
                                <span className="block text-base font-black tracking-tight text-app-navy dark:text-white whitespace-nowrap">
                                    PONTUA<span className="text-app-coral">.</span>
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onCloseMobileSidebar}
                            aria-label="Fechar menu lateral"
                            className="lg:hidden p-1.5 rounded-lg text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav ref={navRef} className="relative p-3.5 space-y-1.5">
                        <div
                            aria-hidden="true"
                            className="absolute left-3.5 right-3.5 top-0 bg-[#4bb9a6] rounded-xl shadow-md shadow-[#4bb9a6]/25 pointer-events-none transition-[transform,height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            style={{
                                transform: `translateY(${pillStyle.top}px)`,
                                height: `${pillStyle.height}px`,
                                opacity: pillStyle.opacity,
                            }}
                        />

                        {visibleNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    data-active={isActive ? 'true' : 'false'}
                                    onClick={() => {
                                        onSelectTab(item.id);
                                        onCloseMobileSidebar();
                                    }}
                                    title={isSidebarCollapsed ? item.label : undefined}
                                    className={`relative z-10 w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer ${
                                        isActive
                                            ? 'text-white'
                                            : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                                >
                                    <Icon className="w-4 h-4 shrink-0 transition-transform duration-200" />
                                    <span
                                        className={`truncate transition-[opacity,max-width] duration-300 ease-in-out ${
                                            isSidebarCollapsed
                                                ? 'max-w-0 opacity-0 pointer-events-none'
                                                : 'max-w-xs opacity-100'
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                    <div
                        className={`w-full bg-slate-50 dark:bg-[#182234] border rounded-xl p-2 flex items-center justify-between gap-2 transition-colors ${
                            activeTab === 'profile'
                                ? 'border-[#4bb9a6] ring-1 ring-[#4bb9a6]/30'
                                : 'border-slate-200/80 dark:border-slate-800'
                        } ${isSidebarCollapsed ? 'flex-col justify-center' : ''}`}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('profile');
                                onCloseMobileSidebar();
                            }}
                            title="Abrir Meu Perfil"
                            aria-label="Abrir Meu Perfil"
                            className={`flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg p-0.5 hover:opacity-90 transition-opacity cursor-pointer focus:outline-none ${
                                isSidebarCollapsed ? 'justify-center' : ''
                            }`}
                        >
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={displayUserName}
                                    className="w-9 h-9 rounded-full object-cover border border-[#4bb9a6]/40 shrink-0"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-[#10b981] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                    {getInitials(displayUserName)}
                                </div>
                            )}

                            <div
                                className={`min-w-0 overflow-hidden transition-[opacity,max-width] duration-300 ease-in-out ${
                                    isSidebarCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-xs opacity-100'
                                }`}
                            >
                                <span className="block text-xs font-extrabold text-app-navy dark:text-white truncate">
                                    {displayUserName}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4bb9a6] whitespace-nowrap">
                                    <Sparkles className="w-3 h-3" />
                                    <span>{displayBalance.toLocaleString('pt-BR')} pts</span>
                                </span>
                            </div>
                        </button>

                        <ThemeToggle className="shrink-0 p-1.5!" />
                    </div>

                    <div className={`flex ${isSidebarCollapsed ? 'justify-center' : 'justify-end px-1'}`}>
                        <button
                            type="button"
                            onClick={onLogout}
                            title={isSidebarCollapsed ? 'Sair' : undefined}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer py-1"
                        >
                            <LogOut className="w-3.5 h-3.5 shrink-0" />
                            <span
                                className={`overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-300 ease-in-out ${
                                    isSidebarCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-16 opacity-100'
                                }`}
                            >
                                Sair
                            </span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
