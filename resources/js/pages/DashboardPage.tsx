import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Gift,
    HeartHandshake,
    LayoutDashboard,
    Send,
    ShieldCheck,
    Trophy,
} from 'lucide-react';
import AboutApaeSection from '@/components/dashboard/AboutApaeSection';
import { AdminSection } from '@/components/dashboard/AdminSection';
import DonationsSection from '@/components/dashboard/DonationsSection';
import { DashboardHeader } from '@/components/dashboard/layout/DashboardHeader';
import { DashboardSidebar, type NavItemConfig } from '@/components/dashboard/layout/DashboardSidebar';
import OverviewSection from '@/components/dashboard/OverviewSection';
import ProfileSection from '@/components/dashboard/ProfileSection';
import RankingSection from '@/components/dashboard/RankingSection';
import RewardDetailModal from '@/components/dashboard/RewardDetailModal';
import RewardsStoreSection from '@/components/dashboard/RewardsStoreSection';
import ScanReceiptModal from '@/components/dashboard/ScanReceiptModal';
import { useDashboardData, type InertiaAuthUser } from '@/hooks/useDashboardData';
import { apiRequest, setAuthToken } from '@/lib/api';
import type { DashboardTab } from '@/types/dashboard';

interface InertiaSharedProps {
    auth?: {
        user?: InertiaAuthUser | null;
    };
    [key: string]: unknown;
}

const NAV_ITEMS: NavItemConfig[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'rewards', label: 'Loja de Prêmios', icon: Gift },
    { id: 'ranking', label: 'Ranking FATEC', icon: Trophy },
    { id: 'donations', label: 'Doar Pontos', icon: Send },
    { id: 'about', label: 'Sobre o Projeto', icon: HeartHandshake },
];

export default function DashboardPage(): React.ReactElement {
    const { props } = usePage<InertiaSharedProps>();
    const inertiaUser = props?.auth?.user;

    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);

    const {
        profile,
        performance,
        ranking,
        receipts,
        receiptsCursor,
        isLoadingReceipts,
        rewards,
        rewardsCursor,
        isLoadingRewards,
        donations,
        donationsCursor,
        isLoadingDonations,
        fetchCoreData,
        fetchReceipts,
        fetchRewards,
        loadMoreDonations,
        handleProfileUpdated,
        handleReceiptCreated,
        handleDonationCreated,
    } = useDashboardData(inertiaUser);

    const handleLogout = async () => {
        try {
            await apiRequest('/api/auth/logout', { method: 'POST' });
        } catch {
            // Proceed to redirect even if session expired
        } finally {
            setAuthToken(null);
            router.visit('/login');
        }
    };

    const isAdmin = profile?.role === 'admin' || inertiaUser?.role === 'admin';

    const visibleNavItems: NavItemConfig[] = isAdmin
        ? [
              ...NAV_ITEMS,
              { id: 'admin', label: 'Administração', icon: ShieldCheck },
          ]
        : NAV_ITEMS;

    const currentTabTitle =
        activeTab === 'profile'
            ? 'Meu Perfil'
            : visibleNavItems.find((item) => item.id === activeTab)?.label || 'Visão Geral';

    const displayUserName = profile?.name || inertiaUser?.name || 'Aluno FATEC';
    const displayBalance = profile?.current_balance ?? 0;
    const currentUserId = profile?.id || inertiaUser?.id;

    return (
        <div className="min-h-screen flex bg-app-bg dark:bg-[#111827] text-app-navy dark:text-gray-100 font-poppins selection:bg-[#4bb9a6] selection:text-white transition-colors duration-300">
            <Head title={`${currentTabTitle} - PONTUA`} />

            <DashboardSidebar
                activeTab={activeTab}
                isSidebarCollapsed={isSidebarCollapsed}
                isMobileSidebarOpen={isMobileSidebarOpen}
                visibleNavItems={visibleNavItems}
                profile={profile}
                displayUserName={displayUserName}
                displayBalance={displayBalance}
                onSelectTab={setActiveTab}
                onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
                onLogout={handleLogout}
            />

            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
                    isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
                }`}
            >
                <DashboardHeader
                    currentTabTitle={currentTabTitle}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
                    onToggleSidebarCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
                    onOpenScanModal={() => setIsScanModalOpen(true)}
                />

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
                            onNavigateTab={setActiveTab}
                        />
                    )}

                    {activeTab === 'rewards' && (
                        <RewardsStoreSection
                            rewards={rewards}
                            currentBalance={displayBalance}
                            isAdmin={isAdmin}
                            hasNextPage={Boolean(rewardsCursor)}
                            isLoading={isLoadingRewards}
                            onLoadMore={() => fetchRewards(rewardsCursor)}
                            onSelectReward={setSelectedRewardId}
                            onRewardsMutated={() => fetchRewards()}
                        />
                    )}

                    {activeTab === 'ranking' && (
                        <RankingSection
                            currentUserId={currentUserId}
                            ranking={ranking.map((user) =>
                                profile && user.id === profile.id
                                    ? {
                                          ...user,
                                          name: profile.name,
                                          nick: profile.nick,
                                          avatar_url: profile.avatar_url,
                                      }
                                    : user
                            )}
                            performance={performance}
                        />
                    )}

                    {activeTab === 'donations' && (
                        <DonationsSection
                            currentBalance={displayBalance}
                            currentUserId={currentUserId}
                            rankingUsers={ranking}
                            donations={donations}
                            hasNextDonationsPage={Boolean(donationsCursor)}
                            isLoadingDonations={isLoadingDonations}
                            onLoadMoreDonations={loadMoreDonations}
                            onDonationCreated={handleDonationCreated}
                        />
                    )}

                    {activeTab === 'about' && (
                        <AboutApaeSection onOpenScanModal={() => setIsScanModalOpen(true)} />
                    )}

                    {activeTab === 'admin' && isAdmin && (
                        <AdminSection onRewardsMutated={() => fetchRewards()} />
                    )}

                    {activeTab === 'profile' && (
                        <ProfileSection
                            profile={profile}
                            onProfileUpdated={handleProfileUpdated}
                        />
                    )}
                </main>
            </div>

            <ScanReceiptModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onSuccess={handleReceiptCreated}
            />

            <RewardDetailModal
                rewardId={selectedRewardId}
                currentBalance={displayBalance}
                profile={profile}
                onClose={() => setSelectedRewardId(null)}
                onRedeemed={() => {
                    fetchCoreData();
                    fetchRewards();
                }}
            />
        </div>
    );
}
