import { apiRequest } from '@/lib/api';
import type { CursorPaginatedResponse, PointDonationItem } from '@/types/dashboard';

export interface DonationRecipientCandidate {
    id: number;
    name: string;
    nick: string | null;
    avatar_url: string | null;
}

export const donationService = {
    async index(cursor?: string | null): Promise<CursorPaginatedResponse<PointDonationItem>> {
        const hasCursor = Boolean(cursor);
        const endpoint = hasCursor
            ? `/api/donation?cursor=${encodeURIComponent(cursor!)}`
            : '/api/donation';

        return apiRequest<CursorPaginatedResponse<PointDonationItem>>(endpoint);
    },

    async searchUsers(query: string): Promise<DonationRecipientCandidate[]> {
        const trimmed = query.trim();
        const isQueryEmpty = !trimmed;

        if (isQueryEmpty) {
            return [];
        }

        try {
            const results = await apiRequest<DonationRecipientCandidate[]>(
                `/api/donation/users?q=${encodeURIComponent(trimmed)}`
            );
            return Array.isArray(results) ? results : [];
        } catch {
            return [];
        }
    },

    async create(recipientId: number, amount: number): Promise<PointDonationItem> {
        return apiRequest<PointDonationItem>('/api/donation', {
            method: 'POST',
            body: JSON.stringify({
                recipient_id: recipientId,
                amount,
            }),
        });
    },
};
