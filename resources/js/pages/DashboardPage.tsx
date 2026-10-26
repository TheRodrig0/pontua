import React, { useCallback, useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Gift,
    TrendingUp,
    Send,
    Heart,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Camera,
    Sparkles,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { PontuaLogoIcon } from '@/components/LogoPontua';
import ThemeToggle from '@/components/ThemeToggle';
import OverviewSection from '@/components/dashboard/OverviewSection';
import RewardsStoreSection from '@/components/dashboard/RewardsStoreSection';
import RankingSection from '@/components/dashboard/RankingSection';
import DonationsSection from '@/components/dashboard/DonationsSection';
import AboutApaeSection from '@/components/dashboard/AboutApaeSection';
import AdminSection from '@/components/dashboard/AdminSection';
import ProfileSection from '@/components/dashboard/ProfileSection';
import ScanReceiptModal from '@/components/dashboard/ScanReceiptModal';
import RewardDetailModal from '@/components/dashboard/RewardDetailModal';
import { apiRequest, setAuthToken } from '@/lib/api';
import type {
    CursorPaginatedResponse,
    DashboardTab,
    MyRankingPerformance,
    PointDonationItem,
    RankingUser,
    RewardItem,
    TaxReceiptItem,
    UserProfile,
} from '@/types/dashboard';

interface InertiaPageProps {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            nick: string | null;
            avatar_url: string | null;
            role: string;
        } | null;
    };
    [key: string]: unknown;
}

const NAV_ITEMS: Array<{
    id: DashboardTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}> = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutGrid },
    { id: 'rewards', label: 'Loja de Recompensas', icon: Gift },
    { id: 'ranking', label: 'Ranking FATEC', icon: TrendingUp },
    { id: 'donations', label: 'Doar Pontos', icon: Send },
    { id: 'about', label: 'Sobre o Projeto', icon: Heart },
];

function getInitials(name?: string): string {
    if (!name || !name.trim()) {
        return 'AL';
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function DashboardPage(): React.ReactElement {
    const { props } = usePage<InertiaPageProps>();
    const inertiaUser = props.auth?.user;

    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // API Data States
    const [profile, setProfile] = useState<UserProfile | null>(
        inertiaUser
            ? {
                  id: inertiaUser.id,
                  name: inertiaUser.name,
                  email: inertiaUser.email,
                  nick: inertiaUser.nick,
                  avatar_url: inertiaUser.avatar_url,
                  role: inertiaUser.role,
                  scan_streak: 0,
                  longest_streak: 0,
                  last_scan_date: null,
                  current_balance: 0,
                  expiring_soon_points: 0,
                  total_receipts: 0,
              }
            : null
    );
    const [performance, setPerformance] = useState<MyRankingPerformance | null>(null);
    const [ranking, setRanking] = useState<RankingUser[]>([]);

    // Cursor Paginated Tax Receipts (/api/tax-receipts)
    const [receipts, setReceipts] = useState<TaxReceiptItem[]>([]);
    const [receiptsCursor, setReceiptsCursor] = useState<string | null>(null);
    const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);

    // Cursor Paginated Rewards (/api/rewards)
    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [rewardsCursor, setRewardsCursor] = useState<string | null>(null);
    const [isLoadingRewards, setIsLoadingRewards] = useState(false);

    // Cursor Paginated Point Donations (/api/donation)
    const [donations, setDonations] = useState<PointDonationItem[]>([]);
    const [donationsCursor, setDonationsCursor] = useState<string | null>(null);
    const [isLoadingDonations, setIsLoadingDonations] = useState(false);

    // Modals State
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);

    const fetchCoreData = useCallback(async () => {
        try {
            const [meData, perfData] = await Promise.all([
                apiRequest<UserProfile>('/api/me'),
                apiRequest<MyRankingPerformance>('/api/ranking/my-performance'),
            ]);
            setProfile(meData);
            setPerformance(perfData);
        } catch {
            // Keep Inertia fallback user if unauthenticated in API
        }
    }, []);

    const fetchReceipts = useCallback(async (cursor?: string | null) => {
        setIsLoadingReceipts(true);
        try {
            const url = cursor
                ? `/api/tax-receipts?cursor=${encodeURIComponent(cursor)}`
                : '/api/tax-receipts';
            const res = await apiRequest<CursorPaginatedResponse<TaxReceiptItem>>(url);
            setReceipts((prev) => (cursor ? [...prev, ...(res.data || [])] : res.data || []));
            setReceiptsCursor(res.next_cursor || null);
        } catch {
            // Ignore error on initial load
        } finally {
            setIsLoadingReceipts(false);
        }
    }, []);

    const fetchRewards = useCallback(async (cursor?: string | null) => {
        setIsLoadingRewards(true);
        try {
            const url = cursor
                ? `/api/rewards?per_page=10&cursor=${encodeURIComponent(cursor)}`
                : '/api/rewards?per_page=10';
            const res = await apiRequest<CursorPaginatedResponse<RewardItem>>(url);
            setRewards((prev) => (cursor ? [...prev, ...(res.data || [])] : res.data || []));
            setRewardsCursor(res.next_cursor || null);
        } catch {
            // Ignore error
        } finally {
            setIsLoadingRewards(false);
        }
    }, []);

    const fetchRankingAndDonations = useCallback(async () => {
        try {
            const [rankList, donationList] = await Promise.all([
                apiRequest<RankingUser[]>('/api/ranking'),
                apiRequest<CursorPaginatedResponse<PointDonationItem>>('/api/donation'),
            ]);
            setRanking(rankList || []);
            setDonations(donationList.data || []);
            setDonationsCursor(donationList.next_cursor || null);
        } catch {
            // Ignore error
        }
    }, []);

    const loadMoreDonations = async () => {
        if (!donationsCursor) {
            return;
        }
        setIsLoadingDonations(true);
        try {
            const res = await apiRequest<CursorPaginatedResponse<PointDonationItem>>(
                `/api/donation?cursor=${encodeURIComponent(donationsCursor)}`
            );
            setDonations((prev) => [...prev, ...(res.data || [])]);
            setDonationsCursor(res.next_cursor || null);
        } finally {
            setIsLoadingDonations(false);
        }
    };

    useEffect(() => {
        const loadInitial = async () => {
            await fetchCoreData();
            await fetchReceipts();
            await fetchRewards();
            await fetchRankingAndDonations();
        };
        loadInitial();
    }, [fetchCoreData, fetchReceipts, fetchRewards, fetchRankingAndDonations]);

    const handleLogout = async () => {
        try {
            await apiRequest('/logout', { method: 'POST' });
        } catch {
            // Proceed to redirect even if session expired
        } finally {
            setAuthToken(null);
            router.visit('/login');
        }
    };

    const isAdmin =
        profile?.role === 'admin' || inertiaUser?.role === 'admin';

    const visibleNavItems = isAdmin
        ? [
              ...NAV_ITEMS,
              { id: 'admin' as DashboardTab, label: 'Administração', icon: ShieldCheck },
          ]
        : NAV_ITEMS;

    const currentTabTitle =
        activeTab === 'profile'
            ? 'Meu Perfil'
            : visibleNavItems.find((item) => item.id === activeTab)?.label || 'Visão Geral';

    const displayUserName = profile?.name || inertiaUser?.name || 'Aluno FATEC';
    const displayBalance = profile?.current_balance ?? 0;

    return (
        <div className="min-h-screen flex bg-app-bg dark:bg-[#111827] text-app-navy dark:text-gray-100 font-poppins selection:bg-[#4bb9a6] selection:text-white transition-colors duration-300">
            <Head title={`${currentTabTitle} - PONTUA`} />

            {/* Mobile Sidebar Backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-white dark:bg-[#151e2e] border-r border-slate-200/80 dark:border-slate-800/90 transition-all duration-300 ${
                    isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
                } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
            >
                {/* Top: Brand Logo & Navigation */}
                <div>
                    <div className="h-18 px-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <PontuaLogoIcon size={36} />
                            {!isSidebarCollapsed && (
                                <div className="leading-tight">
                                    <span className="block text-base font-black tracking-tight text-app-navy dark:text-white">
                                        PONTUA<span className="text-[#4bb9a6]">.</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            aria-label="Fechar menu lateral"
                            className="lg:hidden p-1.5 rounded-lg text-app-graytext dark:text-slate-400 hover:text-app-navy dark:hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="p-3.5 space-y-1.5">
                        {visibleNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsMobileSidebarOpen(false);
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

                {/* Bottom: User Profile Card & Logout */}
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
                                setActiveTab('profile');
                                setIsMobileSidebarOpen(false);
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
                            onClick={handleLogout}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer py-1"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            {!isSidebarCollapsed && <span>Sair</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
                    isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
                }`}
            >
                {/* Topbar */}
                <header className="h-18 bg-white/90 dark:bg-[#151e2e]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/90 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger */}
                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            aria-label="Abrir menu"
                            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-app-navy dark:text-slate-300 hover:text-app-teal dark:hover:text-white"
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        {/* Desktop Collapse Button (<) */}
                        <button
                            type="button"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
                            onClick={() => setIsScanModalOpen(true)}
                            className="bg-[#4bb9a6] hover:bg-[#3da392] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-md shadow-[#4bb9a6]/20 transition-all cursor-pointer"
                        >
                            <Camera className="w-4 h-4" />
                            <span>Doar Cupom Fiscal</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
                    {activeTab === 'overview' && (
                        <OverviewSection
                            profile={profile}
                            performance={performance}
                            receipts={receipts}
                            hasNextReceiptsPage={Boolean(receiptsCursor)}
                            isLoadingReceipts={isLoadingReceipts}
                            onLoadMoreReceipts={() => fetchReceipts(receiptsCursor)}
                            onRefreshReceipts={() => {
                                fetchCoreData();
                                fetchReceipts();
                            }}
                            onOpenScanModal={() => setIsScanModalOpen(true)}
                            onNavigateTab={(tab) => setActiveTab(tab)}
                        />
                    )}

                    {activeTab === 'rewards' && (
                        <RewardsStoreSection
                            rewards={rewards}
                            currentBalance={displayBalance}
                            isAdmin={
                                profile?.role === 'admin' ||
                                inertiaUser?.role === 'admin'
                            }
                            hasNextPage={Boolean(rewardsCursor)}
                            isLoading={isLoadingRewards}
                            onLoadMore={() => fetchRewards(rewardsCursor)}
                            onSelectReward={(id) => setSelectedRewardId(id)}
                            onRewardsMutated={() => fetchRewards()}
                        />
                    )}

                    {activeTab === 'ranking' && (
                        <RankingSection
                            currentUserId={profile?.id || inertiaUser?.id}
                            ranking={ranking.map((u) =>
                                profile && u.id === profile.id
                                    ? {
                                          ...u,
                                          name: profile.name,
                                          nick: profile.nick,
                                          avatar_url: profile.avatar_url,
                                      }
                                    : u,
                            )}
                            performance={performance}
                        />
                    )}

                    {activeTab === 'donations' && (
                        <DonationsSection
                            currentBalance={displayBalance}
                            currentUserId={profile?.id || inertiaUser?.id}
                            rankingUsers={ranking}
                            donations={donations}
                            hasNextDonationsPage={Boolean(donationsCursor)}
                            isLoadingDonations={isLoadingDonations}
                            onLoadMoreDonations={loadMoreDonations}
                            onDonationCreated={(newDonation) => {
                                setDonations((prev) => [newDonation, ...prev]);
                                fetchCoreData();
                                fetchRankingAndDonations();
                            }}
                        />
                    )}

                    {activeTab === 'about' && (
                        <AboutApaeSection
                            onOpenScanModal={() => setIsScanModalOpen(true)}
                        />
                    )}

                    {activeTab === 'admin' && isAdmin && (
                        <AdminSection
                            onRewardsMutated={() => fetchRewards()}
                        />
                    )}

                    {activeTab === 'profile' && (
                        <ProfileSection
                            profile={profile}
                            onProfileUpdated={(updated) => {
                                setProfile(updated);
                                setRanking((prev) =>
                                    prev.map((u) =>
                                        u.id === updated.id
                                            ? {
                                                  ...u,
                                                  name: updated.name,
                                                  nick: updated.nick,
                                                  avatar_url: updated.avatar_url,
                                              }
                                            : u,
                                    ),
                                );
                            }}
                        />
                    )}
                </main>
            </div>

            {/* Modals */}
            <ScanReceiptModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onSuccess={(newReceipt) => {
                    setReceipts((prev) => [newReceipt, ...prev]);
                    fetchCoreData();
                }}
            />

            <RewardDetailModal
                rewardId={selectedRewardId}
                currentBalance={displayBalance}
                onClose={() => setSelectedRewardId(null)}
            />
        </div>
    );
}
