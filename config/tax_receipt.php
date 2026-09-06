<?php

return [
    'max_days_old' => (int) env('TAX_RECEIPT_MAX_DAYS_OLD', 40),
    'min_value' => (float) env('TAX_RECEIPT_MIN_VALUE', 1.00),
    'points_per_real' => (float) env('TAX_RECEIPT_POINTS_PER_REAL', 1.0),
];
