<?php

namespace App\Models;

use App\Enums\PointBucketStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Table('point_buckets')]
#[Fillable([
    'user_id',
    'reference_type',
    'reference_id',
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

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('status', PointBucketStatus::ACTIVE)
            ->where('expires_at', '>', now());
    }

    public function scopeExpiringSoon(Builder $query, int $days = 30): void
    {
        $query->where('status', PointBucketStatus::ACTIVE)
            ->whereBetween('expires_at', [now(), now()->addDays($days)]);
    }

    protected function casts(): array
    {
        return [
            'status' => PointBucketStatus::class,
            'initial_points' => 'integer',
            'remaining_points' => 'integer',
            'expires_at' => 'datetime',
        ];
    }
}
