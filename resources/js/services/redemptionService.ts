import { apiRequest } from '@/lib/api';
import type { CursorPaginatedResponse, RewardTagValue } from '@/types/dashboard';

export type RedemptionStatus = 'pending' | 'completed' | 'cancelled';

interface RedemptionReward {
    id: number;
    name: string;
    tag: RewardTagValue;
    url_image: string | null;
}

/** Pedido de resgate do próprio aluno. */
export interface MyRedemption {
    id: number;
    voucher_code: string;
    status: RedemptionStatus;
    points_cost: number;
    created_at: string;
    redeemed_at: string | null;
    reward: RedemptionReward | null;
}

/** Alias para compatibilidade retroativa */
export type RewardRedemption = MyRedemption;

/** Pedido de resgate visto pelo admin (inclui o aluno). */
export interface RewardRedemptionRequest extends MyRedemption {
    user: {
        id: number;
        name: string;
        nick: string | null;
        email: string;
    } | null;
}

export const redemptionService = {
    async create(rewardId: number): Promise<MyRedemption> {
        return apiRequest<MyRedemption>('/api/redemptions', {
            method: 'POST',
            body: JSON.stringify({ reward_id: rewardId }),
        });
    },

    async listMine(cursor?: string | null): Promise<CursorPaginatedResponse<MyRedemption>> {
        const endpoint = cursor
            ? `/api/redemptions?cursor=${encodeURIComponent(cursor)}`
            : '/api/redemptions';

        return apiRequest<CursorPaginatedResponse<MyRedemption>>(endpoint);
    },

    async adminList(
        status?: RedemptionStatus,
        cursor?: string | null
    ): Promise<CursorPaginatedResponse<RewardRedemptionRequest>> {
        const params = new URLSearchParams();
        if (status) {
            params.set('status', status);
        }
        if (cursor) {
            params.set('cursor', cursor);
        }
        const query = params.toString();

        return apiRequest<CursorPaginatedResponse<RewardRedemptionRequest>>(
            `/api/admin/redemptions${query ? `?${query}` : ''}`
        );
    },

    async adminUpdate(
        id: number,
        status: 'completed' | 'cancelled'
    ): Promise<RewardRedemptionRequest> {
        return apiRequest<RewardRedemptionRequest>(`/api/admin/redemptions/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },
};
