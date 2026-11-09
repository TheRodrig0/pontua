<?php

namespace App\Enums;

enum RewardTag: string
{
    case CLOTHING = 'clothing';
    case ACCESSORY = 'accessory';
    case COSMETIC = 'cosmetic';
    case AACC = 'aacc';
    case OTHER = 'other';
}
