<?php

use App\Jobs\PointExpireJob;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new PointExpireJob)
    ->dailyAt('03:00');
