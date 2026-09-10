<?php

namespace App\Services;

use App\Enums\TaxReceiptStatus;
use App\Models\User;

class UserService
{
    public function me(User $user): User
    {
        $user->loadCount([
            'taxReceipts as total_receipts' => fn($query) => $query->where('status', TaxReceiptStatus::APPROVED),
        ])
            ->loadSum([
                'pointBuckets as current_balance' => fn($query) => $query->active(),
                'pointBuckets as expiring_soon_points' => fn($query) => $query->expiringSoon(),
            ], 'remaining_points');

        $user->current_balance = (int) $user->current_balance;
        $user->expiring_soon_points = (int) $user->expiring_soon_points;
        $user->total_receipts = (int) $user->total_receipts;

        return $user;
    }

    public function update(User $user, array $data): User
    {
        if (isset($data['avatar_id'])) {
            $data['avatar_url'] = asset("avatars/{$data['avatar_id']}.png");
            unset($data['avatar_id']);
        }

        $user->update($data);

        return $user;
    }

    public function delete(User $user): array
    {
        $user->tokens()
            ->delete();

        $user->delete();

        $successPayload = [
            'message' => 'Conta deletada com sucesso.',
        ];

        return $successPayload;
    }

}