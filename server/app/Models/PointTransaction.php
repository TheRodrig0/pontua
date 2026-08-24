<?php

namespace App\Models;

use App\Enums\PointTransactionType;
use App\Enums\PointTransactionSource;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Table('point_transactions')]
#[Fillable([
    'user_id',
    'point_bucket_id',
    'type',
    'amount',
    'source',
    'reference_id', // Pode ter origem de Models diferentes
    'reference_type',
    'balance_after'
])]
class PointTransaction extends Model
{
    use HasFactory;

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    protected function casts(): array
    {
        return [
            'type' => PointTransactionType::class,
            'source' => PointTransactionSource::class,
            'amount' => 'integer',
            'balance_after' => 'integer',
        ];
    }
}
