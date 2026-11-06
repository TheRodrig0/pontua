import React from 'react';
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
    return (
        <>
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
                    onClick={onCloseMobileSidebar}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-white dark:bg-[#151e2e] border-r border-slate-200/80 dark:border-slate-800/90 transition-all duration-300 ${
                    isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
                } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
            >
                <div>
                    <div className="h-18 px-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <PontuaLogoIcon size={36} />
                            {!isSidebarCollapsed && (
                                <div className="leading-tight">
                                    <span className="block text-base font-black tracking-tight text-app-navy dark:text-white">
                                        PONTUA<span className="text-app-coral">.</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onCloseMobileSidebar}
                            aria-label="Fechar menu lateral"
                            className="lg:hidden p-1.5 rounded-lg text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="p-3.5 space-y-1.5">
                        {visibleNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        onSelectTab(item.id);
                                        onCloseMobileSidebar();
                                    }}
                                    title={isSidebarCollapsed ? item.label : undefined}
                                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-[#4bb9a6] text-white shadow-md shadow-[#4bb9a6]/25'
                                            : 'text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    {!isSidebarCollapsed && (
                                        <span className="truncate">{item.label}</span>
                                    )}
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

                            {!isSidebarCollapsed && (
                                <div className="min-w-0">
                                    <span className="block text-xs font-extrabold text-app-navy dark:text-white truncate">
                                        {displayUserName}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4bb9a6]">
                                        <Sparkles className="w-3 h-3" />
                                        <span>{displayBalance.toLocaleString('pt-BR')} pts</span>
                                    </span>
                                </div>
                            )}
                        </button>

                        <ThemeToggle className="shrink-0 p-1.5!" />
                    </div>

                    <div className={`flex ${isSidebarCollapsed ? 'justify-center' : 'justify-end px-1'}`}>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer py-1"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            {!isSidebarCollapsed && <span>Sair</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
