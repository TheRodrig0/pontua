import { apiRequest, getAuthToken } from '@/lib/api';
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

    async sendApaeBatch(): Promise<{ message: string; total_receipts: number; recipient: string }> {
        return apiRequest<{ message: string; total_receipts: number; recipient: string }>('/api/admin/apae-batch/send', {
            method: 'POST',
        });
    },

    async downloadApaeBatch(): Promise<void> {
        const token = getAuthToken();
        const headers: Record<string, string> = {
            Accept: 'application/zip, application/json',
            'X-Requested-With': 'XMLHttpRequest',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/admin/apae-batch/download', {
            method: 'GET',
            credentials: 'same-origin',
            headers,
        });

        if (!response.ok) {
            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json') ? await response.json() : null;
            const firstValidationError = data?.errors
                ? (Object.values(data.errors)[0] as string[])?.[0]
                : null;
            throw new Error(
                firstValidationError || data?.message || 'Não foi possível gerar o arquivo ZIP do lote.'
            );
        }

        const blob = await response.blob();
        const disposition = response.headers.get('content-disposition') || '';
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
        const filename = filenameMatch?.[1] || 'lote-apae.zip';

        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(objectUrl);
    },
};
