<?php

namespace App\Enums;

enum PointBucketStatusEnum: string
{
    case ACTIVE = 'active';
    case EXHAUSTED = 'exhausted';
    case EXPIRED = 'expired';
}