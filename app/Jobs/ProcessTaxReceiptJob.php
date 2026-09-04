<?php

namespace App\Jobs;

use App\Models\TaxReceipt;
use App\Services\TaxReceiptService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessTaxReceiptJob implements ShouldQueue
{
    use Queueable, Dispatchable, SerializesModels, InteractsWithQueue;

    public int $tries = 5;
    public array $backoff = [10, 30, 60, 120, 300];

    public function __construct(
        private readonly TaxReceipt $taxReceipt
    ) {
    }

    public function handle(TaxReceiptService $taxReceiptService): void
    {
        $taxReceiptService->process($this->taxReceipt);
    }
}
