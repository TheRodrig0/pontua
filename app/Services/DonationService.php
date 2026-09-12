<?php

namespace App\Services;

use App\Enums\PointTransactionSource;
use App\Models\Donation;
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

            $isAutoDonation = $userId === $data['recipient_id'];
            if ($isAutoDonation) {
                abort(400, 'Você não pode doar para si.');
            }

            $donation = Donation::create([
                'donor_id' => $userId,
                'recipient_id' => $data['recipient_id'],
                'amount' => $data['amount'],
            ]);

            $this->pointService->debit(
                userId: $userId,
                amount: $data['amount'],
                reference: $donation,
                source: PointTransactionSource::POINTS_DONATION
            );

            $this->pointService->credit(
                userId: $data['recipient_id'],
                amount: $data['amount'],
                reference: $donation,
                source: PointTransactionSource::POINTS_DONATION
            );

            return $donation;
        });

        return $donationSucessfull;
    }
}
