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
