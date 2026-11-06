<?php

namespace App\Services;

use App\Enums\PointTransactionSource;
use App\Models\Donation;
use App\Models\User;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Support\Facades\DB;

class DonationService
{
    public function __construct(
        private readonly PointService $pointService
    ) {}

    public function index(int $userId, int $perPage = 10): CursorPaginator
    {
        $donation = Donation::where('donor_id', $userId)
            ->orderBy('id', 'desc')
            ->cursorPaginate($perPage);

        return $donation;
    }

    public function searchUsers(int $currentUserId, string $search)
    {
        $trimmed = trim($search);
        if ($trimmed === '') {
            return collect();
        }

        $startsWithAt = str_starts_with($trimmed, '@');
        $term = ltrim($trimmed, '@');

        $query = User::query()
            ->select(['id', 'name', 'nick', 'avatar_url'])
            ->where('id', '!=', $currentUserId);

        if ($startsWithAt) {
            $query->whereNotNull('nick');
            if ($term !== '') {
                $query->where('nick', 'like', "%{$term}%");
            }
        } else {
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('nick', 'like', "%{$term}%");
            });
        }

        return $query->orderBy('name')->limit(15)->get();
    }

    public function create(int $userId, array $data): Donation
    {
        $donationSucessfull = DB::transaction(function () use ($userId, $data) {
            $recipientId = (int) $data['recipient_id'];
            $isAutoDonation = $userId === $recipientId;
            if ($isAutoDonation) {
                abort(400, 'Você não pode doar para si.');
            }

            User::whereIn('id', [$userId, $recipientId])
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $donation = Donation::create([
                'donor_id' => $userId,
                'recipient_id' => $recipientId,
                'amount' => $data['amount'],
            ]);

            $inheritedExpiration = $this->pointService->debit(
                userId: $userId,
                amount: $data['amount'],
                reference: $donation,
                source: PointTransactionSource::POINTS_DONATION
            );

            $this->pointService->credit(
                userId: $recipientId,
                amount: $data['amount'],
                reference: $donation,
                source: PointTransactionSource::POINTS_DONATION,
                expiresAt: $inheritedExpiration
            );

            return $donation;
        });

        return $donationSucessfull;
    }
}
