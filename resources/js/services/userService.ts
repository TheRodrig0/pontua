import { apiRequest } from '@/lib/api';
import type { UserProfile } from '@/types/dashboard';

export interface UpdateUserPayload {
    name?: string;
    nick?: string;
    avatar_id?: number;
}

export const userService = {
    async me(): Promise<UserProfile> {
        return apiRequest<UserProfile>('/api/me');
    },

    async update(payload: UpdateUserPayload): Promise<UserProfile> {
        return apiRequest<UserProfile>('/api/me', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    },

    async deleteAccount(password: string): Promise<{ message: string }> {
        return apiRequest<{ message: string }>('/api/me', {
            method: 'DELETE',
            body: JSON.stringify({ password }),
        });
    },
};
