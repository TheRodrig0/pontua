import { useCallback, useEffect, useState } from 'react';
import { subscribeToUserReceiptChannel } from '@/lib/realtime';
import { donationService } from '@/services/donationService';
import { rankingService } from '@/services/rankingService';
import { rewardService } from '@/services/rewardService';
import { taxReceiptService } from '@/services/taxReceiptService';
import { userService } from '@/services/userService';
import type {
    MyRankingPerformance,
    PointDonationItem,
    RankingUser,
    RewardItem,
    TaxReceiptItem,
    UserProfile,
} from '@/types/dashboard';

export interface InertiaAuthUser {
    id: number;
    name: string;
    email: string;
    nick: string | null;
    avatar_url: string | null;
    role: string;
}

export function useDashboardData(inertiaUser?: InertiaAuthUser | null) {
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

    const [receipts, setReceipts] = useState<TaxReceiptItem[]>([]);
    const [receiptsCursor, setReceiptsCursor] = useState<string | null>(null);
    const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);

    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [rewardsCursor, setRewardsCursor] = useState<string | null>(null);
    const [isLoadingRewards, setIsLoadingRewards] = useState(false);

    const [donations, setDonations] = useState<PointDonationItem[]>([]);
    const [donationsCursor, setDonationsCursor] = useState<string | null>(null);
    const [isLoadingDonations, setIsLoadingDonations] = useState(false);

    const fetchCoreData = useCallback(async () => {
        try {
            const [meData, perfData] = await Promise.all([
                userService.me(),
                rankingService.myPerformance(),
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
            const res = await taxReceiptService.index(cursor);
            const hasCursor = Boolean(cursor);
            setReceipts((prev) => (hasCursor ? [...prev, ...(res.data || [])] : res.data || []));
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
            const res = await rewardService.index(cursor, 10);
            const hasCursor = Boolean(cursor);
            setRewards((prev) => (hasCursor ? [...prev, ...(res.data || [])] : res.data || []));
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
                rankingService.index(),
                donationService.index(null),
            ]);
            setRanking(rankList || []);
            setDonations(donationList.data || []);
            setDonationsCursor(donationList.next_cursor || null);
        } catch {
            // Ignore error
        }
    }, []);

    const loadMoreDonations = useCallback(async () => {
        const hasCursor = Boolean(donationsCursor);
        if (!hasCursor) {
            return;
        }
        setIsLoadingDonations(true);
        try {
            const res = await donationService.index(donationsCursor);
            setDonations((prev) => [...prev, ...(res.data || [])]);
            setDonationsCursor(res.next_cursor || null);
        } finally {
            setIsLoadingDonations(false);
        }
    }, [donationsCursor]);

    useEffect(() => {
        const loadInitial = async () => {
            await fetchCoreData();
            await fetchReceipts();
            await fetchRewards();
            await fetchRankingAndDonations();
        };
        loadInitial();
    }, [fetchCoreData, fetchReceipts, fetchRewards, fetchRankingAndDonations]);

    const handleProfileUpdated = useCallback((updated: UserProfile) => {
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
                    : u
            )
        );
    }, []);

    const handleReceiptCreated = useCallback(
        (newReceipt: TaxReceiptItem) => {
            setReceipts((prev) => [newReceipt, ...prev]);
            fetchCoreData();
        },
        [fetchCoreData]
    );

    // Subscribe to Laravel Reverb PrivateChannel("users.{userId}") for TaxReceiptProcessedEvent
    useEffect(() => {
        if (!profile?.id) {
            return;
        }

        const unsubscribe = subscribeToUserReceiptChannel(profile.id, (processedReceipt) => {
            setReceipts((prev) =>
                prev.map((item) =>
                    item.id === processedReceipt.id ? { ...item, ...processedReceipt } : item
                )
            );
            fetchCoreData();
            fetchRankingAndDonations();
        });

        return unsubscribe;
    }, [profile?.id, fetchCoreData, fetchRankingAndDonations]);

    // Poll automatically every 2.5s whenever there is a receipt with status === 'pending'
    // (works seamlessly both with Queue Worker and in environments where WebSocket port 8080 is not exposed)
    useEffect(() => {
        const hasPendingReceipt = receipts.some((r) => r.status === 'pending');
        if (!hasPendingReceipt) {
            return;
        }

        const intervalId = window.setInterval(async () => {
            try {
                const res = await taxReceiptService.index(null);
                if (res?.data) {
                    setReceipts(res.data);
                    const stillPending = res.data.some((r) => r.status === 'pending');
                    if (!stillPending) {
                        await Promise.all([
                            fetchCoreData(),
                            fetchRankingAndDonations(),
                        ]);
                    }
                }
            } catch {
                // Ignore transient polling error
            }
        }, 2500);

        return () => window.clearInterval(intervalId);
    }, [receipts, fetchCoreData, fetchRankingAndDonations]);

    const handleDonationCreated = useCallback(
        (newDonation: PointDonationItem) => {
            setDonations((prev) => [newDonation, ...prev]);
            fetchCoreData();
            fetchRankingAndDonations();
        },
        [fetchCoreData, fetchRankingAndDonations]
    );

    return {
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
        fetchRankingAndDonations,
        loadMoreDonations,
        handleProfileUpdated,
        handleReceiptCreated,
        handleDonationCreated,
    };
}
