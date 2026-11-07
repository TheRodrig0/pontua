<?php

use App\Jobs\PointExpireJob;
use App\Jobs\SendApaeDailyBatchJob;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new PointExpireJob)
    ->dailyAt('03:00');

// Consolidação e envio do lote diário de cupons fiscais para a APAE conforme BPMN oficial
Schedule::job(new SendApaeDailyBatchJob)
    ->dailyAt('00:00');

Schedule::command('sanctum:prune-expired --hours=24')
    ->dailyAt('03:30');
