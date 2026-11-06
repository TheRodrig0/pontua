import { apiRequest } from '@/lib/api';
import type { CursorPaginatedResponse, RewardItem } from '@/types/dashboard';

export const rewardService = {
    async index(cursor?: string | null, perPage = 10): Promise<CursorPaginatedResponse<RewardItem>> {
        const hasCursor = Boolean(cursor);
        const endpoint = hasCursor
            ? `/api/rewards?per_page=${perPage}&cursor=${encodeURIComponent(cursor!)}`
            : `/api/rewards?per_page=${perPage}`;

        return apiRequest<CursorPaginatedResponse<RewardItem>>(endpoint);
    },

    async show(id: number): Promise<RewardItem> {
        return apiRequest<RewardItem>(`/api/rewards/${id}`);
    },

    async store(formData: FormData): Promise<RewardItem> {
        return apiRequest<RewardItem>('/api/rewards', {
            method: 'POST',
            body: formData,
        });
    },

    async update(id: number, formData: FormData): Promise<RewardItem> {
        formData.append('_method', 'PATCH');
        return apiRequest<RewardItem>(`/api/rewards/${id}`, {
            method: 'POST',
            body: formData,
        });
    },

    async destroy(id: number): Promise<{ message: string }> {
        return apiRequest<{ message: string }>(`/api/rewards/${id}`, {
            method: 'DELETE',
        });
    },
};
