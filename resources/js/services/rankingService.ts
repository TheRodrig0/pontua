import { apiRequest } from '@/lib/api';
import type { MyRankingPerformance, RankingUser } from '@/types/dashboard';

export const rankingService = {
    async index(): Promise<RankingUser[]> {
        return apiRequest<RankingUser[]>('/api/ranking');
    },

    async myPerformance(): Promise<MyRankingPerformance> {
        return apiRequest<MyRankingPerformance>('/api/ranking/my-performance');
    },
};
