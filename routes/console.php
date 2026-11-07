<?php

use App\Jobs\PointExpireJob;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new PointExpireJob)
    ->dailyAt('03:00');

Schedule::command('sanctum:prune-expired --hours=24')
    ->dailyAt('03:30');
