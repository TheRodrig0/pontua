<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('point_transaction')]
#[Fillable([
    'user_id',
    'point_bucket_id',
    'type',
    'amount',
    'source',
    'reference_id', # (UnsignedBigInteger): O ID do objeto relacionado (ex: se source = reward_redemption, guarda o ID do redemptions).
    'balance_after'
])]
class PointTransaction extends Model
{
    use HasFactory;

    public function casts(): array
    {
        return [

        ];
    }
}
