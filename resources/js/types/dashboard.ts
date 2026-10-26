export type DashboardTab = 'overview' | 'rewards' | 'ranking' | 'donations' | 'about' | 'admin' | 'profile';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    nick: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin' | string;
    scan_streak: number;
    longest_streak: number;
    last_scan_date: string | null;
    current_balance: number;
    expiring_soon_points: number;
    total_receipts: number;
}

export interface RankingUser {
    position: number;
    id: number;
    name: string;
    nick: string | null;
    avatar_url: string | null;
    scan_streak: number;
    total_donated: number;
}

export interface MyRankingPerformance {
    position?: number;
    total_donated?: number;
    points_to_next_position?: number | null;
    next_position?: number | null;
    scan_streak?: number;
}

export type TaxReceiptStatusType = 'pending' | 'approved' | 'rejected';

export interface TaxReceiptItem {
    id: number;
    user_id: number;
    access_key: string;
    value: string | number;
    points_earned: number;
    issue_date: string | null;
    status: TaxReceiptStatusType;
    rejection_reason: string | null;
    original_url: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        nick: string | null;
        email: string;
    };
}

export type RewardTagType = 'clothing' | 'accessory' | 'cosmetic' | 'other';
export type RewardTagValue = RewardTagType;

export interface RewardItem {
    id: number;
    name: string;
    description: string | null;
    tag: RewardTagType;
    url_image: string | null;
    cost: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface PointDonationItem {
    id: number;
    donor_id: number;
    recipient_id: number;
    amount: number;
    created_at: string;
    updated_at: string;
}

export interface AdminUserData {
    id: number;
    name: string;
    email: string;
    nick: string | null;
    role: string;
    scan_streak: number;
    total_receipts: number;
    current_balance: number;
    created_at: string;
}

export interface AdminOverviewData {
    stats: {
        total_users: number;
        total_receipts: number;
        approved_receipts: number;
        pending_receipts: number;
        rejected_receipts: number;
        total_value_donated: number;
        total_points_distributed: number;
        total_rewards: number;
    };
    recent_receipts: TaxReceiptItem[];
    users: AdminUserData[];
    rewards: RewardItem[];
}

export interface CursorPaginatedResponse<T> {
    data: T[];
    path: string;
    per_page: number;
    next_cursor: string | null;
    prev_cursor: string | null;
    next_page_url?: string | null;
    prev_page_url?: string | null;
}
