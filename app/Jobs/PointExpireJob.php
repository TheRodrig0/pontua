<?php

namespace App\Jobs;

use App\Services\PointService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PointExpireJob implements ShouldQueue
{
    use Queueable, Dispatchable, SerializesModels, InteractsWithQueue;

    public int $tries = 3;
    public array $backoff = [60, 180, 300];

    public function __construct()
    {
    }

    public function handle(PointService $pointService): void
    {
        $pointService->expire();
    }
}
