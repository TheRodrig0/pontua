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

    public int $tries = 3;
    public array $backoff = [5, 15, 30];

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
        if ($exception) {
            \Illuminate\Support\Facades\Log::warning('ProcessTaxReceiptJob failed', [
                'tax_receipt_id' => $this->taxReceipt->id,
                'access_key' => $this->taxReceipt->access_key,
                'url' => (string) $this->taxReceipt->original_url,
                'error' => $exception->getMessage(),
            ]);
        }

        $this->taxReceipt->refresh();

        if ($this->taxReceipt->status === TaxReceiptStatus::PENDING) {
            $this->taxReceipt->update([
                'status' => TaxReceiptStatus::REJECTED,
                'rejection_reason' => TaxReceiptService::SEFAZ_COMMUNICATION_ERROR_MESSAGE,
            ]);

            TaxReceiptProcessedEvent::dispatch($this->taxReceipt);
        }
    }
}
