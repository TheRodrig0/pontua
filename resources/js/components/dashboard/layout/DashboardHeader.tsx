import React from 'react';
import { Camera, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface DashboardHeaderProps {
    currentTabTitle: string;
    isSidebarCollapsed: boolean;
    onOpenMobileSidebar: () => void;
    onToggleSidebarCollapse: () => void;
    onOpenScanModal: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    currentTabTitle,
    isSidebarCollapsed,
    onOpenMobileSidebar,
    onToggleSidebarCollapse,
    onOpenScanModal,
}) => {
    return (
        <header className="h-18 bg-white/90 dark:bg-[#151e2e]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/90 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenMobileSidebar}
                    aria-label="Abrir menu"
                    className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-app-navy dark:text-slate-300 hover:text-app-teal dark:hover:text-white"
                >
                    <Menu className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={onToggleSidebarCollapse}
                    aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
                    className="hidden lg:flex w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700/80 text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 items-center justify-center transition-colors cursor-pointer"
                >
                    {isSidebarCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                </button>

                <h1 className="text-lg sm:text-xl font-extrabold text-app-navy dark:text-white tracking-tight">
                    {currentTabTitle}
                </h1>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                    type="button"
                    onClick={onOpenScanModal}
                    className="bg-[#4bb9a6] hover:bg-[#3da392] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer"
                >
                    <Camera className="w-4 h-4" />
                    <span>Doar Cupom Fiscal</span>
                </button>
            </div>
        </header>
    );
};
