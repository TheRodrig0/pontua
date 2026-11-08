<?php

namespace App\Jobs;

use App\Enums\TaxReceiptStatus;
use App\Mail\ApaeDailyBatchMail;
use App\Models\TaxReceipt;
use App\Services\ApaeBatchService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendApaeDailyBatchJob implements ShouldQueue
{
    use Queueable, Dispatchable, SerializesModels, InteractsWithQueue;

    public int $tries = 3;
    public array $backoff = [60, 180, 300];

    public function __construct()
    {
    }

    public function handle(): void
    {
        $lock = Cache::lock('apae-batch-send', 60);
        if (! $lock->get()) {
            return;
        }

        try {
            $batchService = app(ApaeBatchService::class);

            $receipts = TaxReceipt::query()
                ->where('status', TaxReceiptStatus::APPROVED)
                ->whereNull('sent_to_apae_at')
                ->orderBy('id', 'asc')
                ->limit(ApaeBatchService::MAX_BATCH_SIZE)
                ->get();

            if ($receipts->isEmpty()) {
                return;
            }

            $recipient = $batchService->resolveRecipientEmail();
            if (! $recipient) {
                return;
            }

            $today = now()->format('d/m/Y');
            $totalReceipts = $receipts->count();

            Mail::to($recipient)->send(
                new ApaeDailyBatchMail(
                    receipts: $receipts,
                    date: $today,
                    totalReceipts: $totalReceipts
                )
            );

            TaxReceipt::whereIn('id', $receipts->pluck('id'))
                ->update(['sent_to_apae_at' => now()]);

            Log::info('Daily APAE batch sent successfully', [
                'recipient' => $recipient,
                'total_receipts' => $totalReceipts,
            ]);
        } finally {
            $lock->release();
        }
    }
}

