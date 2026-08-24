<?php

namespace App\Enums;

enum TaxReceiptStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case DUPLICATED = 'duplicated';
}