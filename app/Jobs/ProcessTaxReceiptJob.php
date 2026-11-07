<?php

namespace App\Jobs;

use App\Enums\TaxReceiptStatus;
use App\Events\TaxReceiptProcessedEvent;
use App\Models\TaxReceipt;
use App\Services\TaxReceiptService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

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
        try {
            $taxReceiptService->process($this->taxReceipt);
        } catch (Throwable $e) {
            // Em caso de execução síncrona (SyncJob) ou se tiver atingido o limite de tentativas
            if (
                $this->job === null ||
                $this->job instanceof \Illuminate\Queue\Jobs\SyncJob ||
                $this->attempts() >= $this->tries
            ) {
                $this->failed($e);
                return;
            }

            throw $e;
        }
    }

    public function failed(?Throwable $exception): void
    {
        $this->taxReceipt->refresh();

        if ($this->taxReceipt->status === TaxReceiptStatus::PENDING) {
            $this->taxReceipt->update([
                'status' => TaxReceiptStatus::REJECTED,
                'rejection_reason' => 'Falha de comunicação com o portal da SEFAZ-SP. Tente novamente mais tarde.',
            ]);

            TaxReceiptProcessedEvent::dispatch($this->taxReceipt);
        }
    }
}
