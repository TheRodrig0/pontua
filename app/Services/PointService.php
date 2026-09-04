<?php

namespace App\Services;

use App\Enums\PointTransactionSource;
use Illuminate\Database\Eloquent\Model;

class PointService
{
    public function credit(
        int $userId,
        int $amount,
        ?Model $reference = null,
        PointTransactionSource $source
    ): void {

    }

    public function debit(
        int $userId,
        int $amount,
        ?Model $reference = null,
        PointTransactionSource $source
    ): void {

    }
}