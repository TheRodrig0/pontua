<?php

namespace App\Mail;

use App\Services\ApaeBatchService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApaeDailyBatchMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 60, 300];

    public function __construct(
        public readonly Collection $receipts,
        public readonly string $date,
        public readonly int $totalReceipts,
        public readonly ?float $totalValue = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Lote Diário de Cupons Fiscais - {$this->date} - Pontua & APAE"
        );
    }

    public function content(): Content
    {
        $safeDate = str_replace(['/', '\\'], '-', $this->date);

        return new Content(
            view: 'emails.apae-batch',
            with: [
                'date' => $this->date,
                'totalReceipts' => $this->totalReceipts,
                'filename' => "lote-apae-{$safeDate}.zip",
            ]
        );
    }

    public function attachments(): array
    {
        $safeDate = str_replace(['/', '\\'], '-', $this->date);
        $batchService = app(ApaeBatchService::class);

        return [
            Attachment::fromData(
                fn() => $batchService->generateBatchZip($this->receipts, $this->date),
                "lote-apae-{$safeDate}.zip"
            )->withMime('application/zip'),
        ];
    }
}
