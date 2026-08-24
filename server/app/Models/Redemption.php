<?php

namespace App\Models;

use App\Enums\RedemptionStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('redemptions')]
#[Fillable([
    'user_id',
    'reward_id',
    'points_cost',
    'status',
    'voucher_code',
    'redeemed_at'
])]
class Redemption extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class, 'reward_id');
    }

    protected function casts(): array
    {
        return [
            'status' => RedemptionStatus::class,
            'points_cost' => 'integer',
            'redeemed_at' => 'datetime',
        ];
    }
}
