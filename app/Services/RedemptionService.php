<?php

namespace App\Services;

use App\Enums\PointTransactionSource;
use App\Enums\RedemptionStatus;
use App\Models\Redemption;
use App\Models\Reward;
use App\Models\User;
use App\Notifications\RewardRedeemedNotification;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class RedemptionService
{
    private const VOUCHER_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    private const REFUND_GRACE_DAYS = 30;

    public function __construct(
        private readonly PointService $pointService
    ) {}

    public function indexForUser(int $userId, int $perPage = 10): CursorPaginator
    {
        return Redemption::with('reward:id,name,tag,url_image')
            ->where('user_id', $userId)
            ->orderBy('id', 'desc')
            ->cursorPaginate($perPage);
    }

    public function indexForAdmin(?string $status, int $perPage = 20): CursorPaginator
    {
        $query = Redemption::with(['user:id,name,nick,email', 'reward:id,name,tag,url_image'])
            ->orderBy('id', 'desc');

        $validStatus = $status ? RedemptionStatus::tryFrom($status) : null;
        if ($validStatus) {
            $query->where('status', $validStatus);
        }

        return $query->cursorPaginate($perPage);
    }

    public function create(int $userId, int $rewardId): Redemption
    {
        // Em caso (raríssimo) de colisão do código único, tenta de novo.
        for ($attempt = 1; ; $attempt++) {
            try {
                $redemption = $this->createOnce($userId, $rewardId);
                break;
            } catch (UniqueConstraintViolationException $e) {
                if ($attempt >= 3) {
                    throw $e;
                }
            }
        }

        // Dispara e-mail com o código de resgate para o aluno
        if ($redemption->user) {
            $redemption->user->notify(new RewardRedeemedNotification($redemption));
        }

        return $redemption;
    }

    private function createOnce(int $userId, int $rewardId): Redemption
    {
        return DB::transaction(function () use ($userId, $rewardId) {
            // Serializa pedidos concorrentes do mesmo aluno.
            $user = User::where('id', $userId)->lockForUpdate()->firstOrFail();

            $reward = Reward::where('id', $rewardId)->lockForUpdate()->first();
            if (! $reward || ! $reward->is_active) {
                abort(404, 'Recompensa indisponível.');
            }

            $isOutOfStock = $reward->stock !== null && $reward->stock < 1;
            if ($isOutOfStock) {
                abort(409, 'Recompensa esgotada.');
            }

            $hasPending = Redemption::where('user_id', $userId)
                ->where('reward_id', $rewardId)
                ->where('status', RedemptionStatus::PENDING)
                ->exists();
            if ($hasPending) {
                abort(409, 'Você já tem um pedido pendente para esta recompensa.');
            }

            $redemption = Redemption::create([
                'user_id' => $userId,
                'reward_id' => $rewardId,
                'points_cost' => $reward->cost,
                'status' => RedemptionStatus::PENDING,
                'voucher_code' => $this->generateVoucherCode(),
            ]);

            // Aborta com 400 se o saldo for insuficiente (desfaz a transação).
            $expiresAt = $this->pointService->debit(
                userId: $userId,
                amount: $reward->cost,
                reference: $redemption,
                source: PointTransactionSource::REWARD_REDEMPTION
            );

            $redemption->update(['points_expires_at' => $expiresAt]);

            if ($reward->stock !== null) {
                $reward->decrement('stock');
            }

            return $redemption->load(['reward:id,name,tag,url_image', 'user:id,name,email']);
        });
    }

    public function complete(int $id, int $adminId): Redemption
    {
        return DB::transaction(function () use ($id, $adminId) {
            $redemption = $this->lockPending($id);

            $redemption->update([
                'status' => RedemptionStatus::COMPLETED,
                'redeemed_at' => now(),
                'processed_by' => $adminId,
            ]);

            return $redemption->load(['user:id,name,nick,email', 'reward:id,name,tag,url_image']);
        });
    }

    public function cancel(int $id, int $adminId): Redemption
    {
        return DB::transaction(function () use ($id, $adminId) {
            $redemption = $this->lockPending($id);

            $redemption->update([
                'status' => RedemptionStatus::CANCELLED,
                'redeemed_at' => now(),
                'processed_by' => $adminId,
            ]);

            $keepsOriginalExpiration = $redemption->points_expires_at !== null
                && $redemption->points_expires_at->isFuture();

            $expiresAt = $keepsOriginalExpiration
                ? $redemption->points_expires_at
                : now()->addDays(self::REFUND_GRACE_DAYS);

            $this->pointService->credit(
                userId: $redemption->user_id,
                amount: $redemption->points_cost,
                reference: $redemption,
                source: PointTransactionSource::REWARD_REFUND,
                expiresAt: $expiresAt
            );

            $reward = Reward::where('id', $redemption->reward_id)->lockForUpdate()->first();
            if ($reward && $reward->stock !== null) {
                $reward->increment('stock');
            }

            return $redemption->load(['user:id,name,nick,email', 'reward:id,name,tag,url_image']);
        });
    }

    /**
     * Trava o pedido e garante que ainda está pendente (idempotência / sem estorno duplo).
     */
    private function lockPending(int $id): Redemption
    {
        $redemption = Redemption::where('id', $id)->lockForUpdate()->firstOrFail();

        if ($redemption->status !== RedemptionStatus::PENDING) {
            abort(409, 'Este pedido já foi processado.');
        }

        return $redemption;
    }

    private function generateVoucherCode(): string
    {
        $alphabetLength = strlen(self::VOUCHER_ALPHABET);
        $code = '';

        for ($i = 0; $i < 8; $i++) {
            $code .= self::VOUCHER_ALPHABET[random_int(0, $alphabetLength - 1)];
        }

        return 'RES-' . $code;
    }
}

