<?php

namespace App\Enums;

enum TaxReceiptStatusEnum: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case DUPLICATED = 'duplicated';
}