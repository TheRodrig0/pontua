<?php

namespace App\Enums;

enum PointBucketStatus: string
{
    case ACTIVE = 'active';
    case EXHAUSTED = 'exhausted';
    case EXPIRED = 'expired';
}