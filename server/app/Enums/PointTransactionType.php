<?php

namespace App\Enums;

enum PointTransactionType: string
{
    case DEBIT = 'debit';
    case CREDIT = 'credit';
}