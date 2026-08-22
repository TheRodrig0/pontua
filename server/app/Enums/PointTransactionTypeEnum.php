<?php

namespace App\Enums;

enum PointTransactionTypeEnum: string
{
    case DEBIT = 'debit';
    case CREDIT = 'credit';
}