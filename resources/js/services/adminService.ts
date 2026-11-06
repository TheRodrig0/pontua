import { apiRequest } from '@/lib/api';
import type { AdminOverviewData } from '@/types/dashboard';

export const adminService = {
    async getOverview(): Promise<AdminOverviewData> {
        return apiRequest<AdminOverviewData>('/api/admin/overview');
    },

    async updateUser(userId: number, payload: Record<string, unknown>): Promise<void> {
        await apiRequest(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    },
};
