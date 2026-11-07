import { apiRequest } from '@/lib/api';
import type { AdminOverviewData } from '@/types/dashboard';

export interface AdminSettingsData {
    apae_email: string;
}

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

    async getSettings(): Promise<AdminSettingsData> {
        return apiRequest<AdminSettingsData>('/api/admin/settings');
    },

    async updateSettings(payload: AdminSettingsData): Promise<{ message: string; settings: AdminSettingsData }> {
        return apiRequest<{ message: string; settings: AdminSettingsData }>('/api/admin/settings', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    },
};
