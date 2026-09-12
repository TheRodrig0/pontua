<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RankingService
{
    public function index(int $limit = 10): Collection
    {
        $cacheKey = "ranking_top_{$limit}";
        $timeToLive = now()->addMinutes(5);

        $ranking = Cache::remember($cacheKey, $timeToLive, function () use ($limit) {
            return User::select([
                'id',
                'name',
                'nick',
                'avatar_url',
                'scan_streak',
            ])
                ->withSum('pointBuckets as total_donated', 'initial_points')
                ->orderByDesc('total_donated')
                ->orderBy('id', 'asc')
                ->limit($limit)
                ->get()
                ->each(function (User $user, int $index) {
                    $user->position = $index + 1;
                    $user->total_donated = (int) $user->total_donated;
                });
        });

        return $ranking;
    }

    public function me(int $userId): array
    {
        $cacheKey = "ranking_performance_{$userId}";
        $timeToLive = now()->addMinutes(5);

        $performance = Cache::remember($cacheKey, $timeToLive, function () use ($userId) {
            $query = '
                -- CTE para ranquear todos os usuarios e mapear a distancia de pontos para a posicao superior
                WITH ranked_users AS (
                    SELECT 
                        users.id,
                        users.scan_streak,
                        COALESCE(SUM(point_buckets.initial_points), 0) AS total_donated,

                        -- Posicao no ranking com criterio de desempate por id
                        DENSE_RANK() OVER (ORDER BY COALESCE(SUM(point_buckets.initial_points), 0) DESC, users.id ASC) AS position,

                        -- Pontuacao do usuario imediatamente a frente
                        LAG(COALESCE(SUM(point_buckets.initial_points), 0)) OVER (ORDER BY COALESCE(SUM(point_buckets.initial_points), 0) DESC, users.id ASC) AS points_ahead

                        FROM users
                    -- Inclui usuarios mesmo que ainda nao tenham pontuacoes registradas
                    LEFT JOIN point_buckets ON users.id = point_buckets.user_id

                     GROUP BY users.id, users.scan_streak
                )

                -- Filtra exclusivamente a linha de performance do usuario solicitado
                SELECT * FROM ranked_users WHERE id = ?
            ';

            $data = DB::selectOne($query, [$userId]);

            if ($data === null) {
                $emptyPerformance = [];

                return $emptyPerformance;
            }

            $pointsToNextPosition = null;
            $nextPosition = null;

            if ($data->points_ahead !== null) {
                $pointsToNextPosition = (int) $data->points_ahead - (int) $data->total_donated;
                $nextPosition = (int) $data->position - 1;
            }

            $result = [
                'position' => (int) $data->position,
                'total_donated' => (int) $data->total_donated,
                'points_to_next_position' => $pointsToNextPosition,
                'next_position' => $nextPosition,
                'scan_streak' => (int) ($data->scan_streak ?? 0),
            ];

            return $result;
        });

        return $performance;
    }
}
