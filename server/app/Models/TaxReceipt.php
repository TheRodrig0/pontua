<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\TaxReceiptStatusEnum;

#[Table('tax_receipt')]
#[Fillable([
    'user_id',
    'access_key',
    'value',
    'points_earned',
    'issue_date',
    'status',
])]
class TaxReceipt extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    protected function casts(): array
    {
        return [
            'status' => TaxReceiptStatusEnum::class,
            'value' => 'decimal:2',
            'points_earned' => 'integer',
            'issue_date' => 'datetime',
        ];
    }
}
