<?php

namespace App\Models;

use App\Enums\PointBucketStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


#[Table('point_bucket')]
#[Fillable([
    'user_id',
    'tax_receipt_id',
    'initial_points',
    'remaining_points',
    'expires_at',
    'status'
])]
class PointBucket extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function taxReceipt(): BelongsTo
    {
        return $this->belongsTo(TaxReceipt::class, 'tax_receipt_id');
    }

    protected function casts(): array
    {
        return [
            'status' => PointBucketStatusEnum::class,
            'initial_points' => 'integer',
            'remaining_points' => 'integer',
            'expires_at' => 'datetime',
        ];
    }
}
