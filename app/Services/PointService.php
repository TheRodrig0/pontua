<?php

namespace App\Services;

use App\Enums\PointBucketStatus;
use App\Enums\PointTransactionSource;
use App\Enums\PointTransactionType;
use App\Models\PointBucket;
use App\Models\PointTransaction;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PointService
{
    public function credit(
        int $userId,
        int $amount,
        ?Model $reference = null,
        PointTransactionSource $source = PointTransactionSource::POINTS_DONATION,
        ?CarbonInterface $expiresAt = null
    ): void {
        DB::transaction(function () use ($userId, $amount, $reference, $source, $expiresAt) {
            User::where('id', $userId)
                ->lockForUpdate()
                ->first();

            $expirationDate = $expiresAt ?? now()->addMonths((int) config('points.expiration_months', 6));

            $bucket = PointBucket::create([
                'user_id' => $userId,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
                'initial_points' => $amount,
                'remaining_points' => $amount,
                'expires_at' => $expirationDate,
                'status' => PointBucketStatus::ACTIVE,
            ]);

            $lastTransaction = PointTransaction::where('user_id', $userId)
                ->latest('id')
                ->lockForUpdate()
                ->first();

            $currentBalance = $lastTransaction?->balance_after ?? 0;
            $newBalance = $currentBalance + $amount;

            PointTransaction::create([
                'user_id' => $userId,
                'amount' => $amount,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
                'source' => $source,
                'type' => PointTransactionType::CREDIT,
                'point_bucket_id' => $bucket->id,
                'balance_after' => $newBalance,
            ]);
        });
    }

    public function debit(
        int $userId,
        int $amount,
        ?Model $reference = null,
        PointTransactionSource $source = PointTransactionSource::POINTS_DONATION
    ): ?CarbonInterface {
        return DB::transaction(function () use ($userId, $amount, $reference, $source) {
            User::where('id', $userId)
                ->lockForUpdate()
                ->first();

            $activeBuckets = PointBucket::where('user_id', $userId)
                ->where('status', PointBucketStatus::ACTIVE)
                ->where('expires_at', '>', now())
                ->orderBy('expires_at', 'asc')
                ->lockForUpdate()
                ->get();

            $totalAvailable = $activeBuckets->sum('remaining_points');

            $hasInsufficientFunds = $amount > $totalAvailable;
            if ($hasInsufficientFunds) {
                abort(400, 'Você não tem fundos suficientes para esta transação.');
            }

            $lastTransaction = PointTransaction::where('user_id', $userId)
                ->latest('id')
                ->lockForUpdate()
                ->first();

            $runningBalance = $lastTransaction?->balance_after ?? 0;
            $pointsToDeduct = $amount;
            $earliestExpiration = null;

            foreach ($activeBuckets as $bucket) {
                $hasPointsLeftToDeduct = $pointsToDeduct > 0;
                if (! $hasPointsLeftToDeduct) {
                    break;
                }

                $hasNotSetEarliest = $earliestExpiration === null;
                if ($hasNotSetEarliest) {
                    $earliestExpiration = $bucket->expires_at;
                }

                $availableInBucket = $bucket->remaining_points;
                $deductFromThisBucket = min($availableInBucket, $pointsToDeduct);

                $remainingInBucket = $availableInBucket - $deductFromThisBucket;
                $pointsToDeduct -= $deductFromThisBucket;
                $runningBalance -= $deductFromThisBucket;

                $status = PointBucketStatus::ACTIVE;
                $isBucketDepleted = $remainingInBucket === 0;
                if ($isBucketDepleted) {
                    $status = PointBucketStatus::EXHAUSTED;
                }

                $bucket->update([
                    'remaining_points' => $remainingInBucket,
                    'status' => $status,
                ]);

                PointTransaction::create([
                    'user_id' => $userId,
                    'point_bucket_id' => $bucket->id,
                    'type' => PointTransactionType::DEBIT,
                    'amount' => $deductFromThisBucket,
                    'source' => $source,
                    'reference_type' => $reference?->getMorphClass(),
                    'reference_id' => $reference?->getKey(),
                    'balance_after' => $runningBalance,
                ]);
            }

            return $earliestExpiration;
        });
    }

    public function expire(): void
    {
        $chunkSize = 100;

        PointBucket::where('status', PointBucketStatus::ACTIVE)
            ->where('expires_at', '<=', now())
            ->where('remaining_points', '>', 0)
            ->chunkById($chunkSize, function ($buckets) {
                foreach ($buckets as $bucket) {
                    DB::transaction(function () use ($bucket) {
                        $bucket = PointBucket::where('id', $bucket->id)
                            ->lockForUpdate()
                            ->first();

                        $isInvalidBucket = ! $bucket
                            || $bucket->status !== PointBucketStatus::ACTIVE
                            || $bucket->remaining_points <= 0;

                        if ($isInvalidBucket) {
                            return;
                        }

                        $lostPoints = $bucket->remaining_points;

                        $bucket->update([
                            'remaining_points' => 0,
                            'status' => PointBucketStatus::EXPIRED,
                        ]);

                        $lastTransaction = PointTransaction::where('user_id', $bucket->user_id)
                            ->latest('id')
                            ->lockForUpdate()
                            ->first();

                        $currentBalance = $lastTransaction?->balance_after ?? 0;
                        $newBalance = $currentBalance - $lostPoints;

                        PointTransaction::create([
                            'user_id' => $bucket->user_id,
                            'point_bucket_id' => $bucket->id,
                            'type' => PointTransactionType::DEBIT,
                            'amount' => $lostPoints,
                            'source' => PointTransactionSource::AUTO_EXPIRATION,
                            'balance_after' => $newBalance,
                        ]);
                    });
                }
            });
    }
}