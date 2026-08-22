<?php

namespace App\Enums;

enum AchievementType: string
{
    case BADGE = 'badge';
    case TITLE = 'title';
    case BOTH = 'both';
}
