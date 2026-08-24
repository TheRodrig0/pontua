<?php

namespace App\Enums;

enum PointTransactionSource: string
{
    case INVOICE_SUBMISSION = 'invoice_submission';
    case REWARD_REDEMPTION = 'reward_redemption';
    case POINTS_DONATION = 'points_donation';
    case AUTO_EXPIRATION = 'auto_expiration';
}