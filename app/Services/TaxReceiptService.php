<?php

namespace App\Services;

use App\Events\TaxReceiptProcessedEvent;
use App\Models\TaxReceipt;
use App\Scrapers\NfceScraper;
use Illuminate\Contracts\Pagination\CursorPaginator;
use App\Jobs\ProcessTaxReceiptJob;
use App\Enums\TaxReceiptStatus;
use Illuminate\Support\Facades\DB;
use App\Enums\SefazReceiptStatus;
use App\Enums\PointTransactionSource;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class TaxReceiptService
{
    public function __construct(
        private readonly NfceScraper $nfceScraper,
        private readonly PointService $pointService
    ) {
    }

    public function index(int $userId, int $perPage = 5): CursorPaginator
    {
        return TaxReceipt::where('user_id', $userId)
            ->latest('id')
            ->cursorPaginate($perPage);
    }

    /**
     * @throws ValidationException
     */
    public function store(int $userId, array $data): TaxReceipt
    {
        try {
            $taxReceipt = TaxReceipt::create([
                'user_id' => $userId,
                'status' => TaxReceiptStatus::PENDING,
                'points_earned' => 0,
                'value' => 0,
                'access_key' => $data['access_key'],
                'original_url' => $data['url']
            ]);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages([
                'access_key' => ['Esta nota fiscal já foi inserida no sistema.'],
            ]);
        }

        ProcessTaxReceiptJob::dispatch($taxReceipt)
            ->afterCommit();

        return $taxReceipt;
    }

    public function process(TaxReceipt $taxReceipt): void
    {
        $lockKey = "process-tax-receipt:{$taxReceipt->id}";
        $seconds = 30;
        $lock = Cache::lock($lockKey, $seconds);

        if (!$lock->get()) {
            return;
        }

        try {
            $scraped = $this->nfceScraper->scrape((string) $taxReceipt->original_url);

            $rejectReason = $this->getRejectionReason($scraped);

            $status = TaxReceiptStatus::APPROVED;
            if ($rejectReason) {
                $status = TaxReceiptStatus::REJECTED;
            }

            $pointsEarned = 0;
            if ($status === TaxReceiptStatus::APPROVED) {
                $pointsPerReal = (float) config('tax_receipt.points_per_real', 1.0);
                $pointsEarned = (int) round(((float) $scraped['value']) * $pointsPerReal);
            }

            $processedReceipt = DB::transaction(function () use ($taxReceipt, $scraped, $status, $rejectReason, $pointsEarned) {
                $lockedReceipt = TaxReceipt::where('id', $taxReceipt->id)
                    ->lockForUpdate()
                    ->first();

                if ($lockedReceipt->status !== TaxReceiptStatus::PENDING) {
                    return null;
                }

                $lockedReceipt->update([
                    'value' => $scraped['value'] ?? 0,
                    'status' => $status,
                    'issue_date' => $scraped['issueDate'] ?? null,
                    'rejection_reason' => $rejectReason,
                    'points_earned' => $pointsEarned
                ]);

                if ($pointsEarned > 0) {
                    $this->pointService->credit(
                        userId: $lockedReceipt->user_id,
                        amount: $pointsEarned,
                        reference: $lockedReceipt,
                        source: PointTransactionSource::INVOICE_SUBMISSION
                    );
                }

                return $lockedReceipt;
            });

            if ($processedReceipt) {
                TaxReceiptProcessedEvent::dispatch($processedReceipt);
            }

        } finally {
            $lock->release();
        }
    }

    private function getRejectionReason(array $scraped): ?string
    {
        $isSuccess = $scraped['status'] === SefazReceiptStatus::SUCCESS;
        if (!$isSuccess) {
            return $scraped['status']->message();
        }

        $isValidValue = $scraped['value'] !== null;
        $isValidDate = $scraped['issueDate'] !== null;
        if (!$isValidValue || !$isValidDate) {
            return 'Falha ao ler os dados estruturais da nota fiscal.';
        }

        $maxDaysOld = (int) config('tax_receipt.max_days_old', 40);
        $isOlderThanMaxDays = Carbon::parse($scraped['issueDate'])->diffInDays(now()) > $maxDaysOld;
        if ($isOlderThanMaxDays) {
            return "Nota fiscal com mais de {$maxDaysOld} dias de emissão.";
        }

        $minValue = (float) config('tax_receipt.min_value', 1.00);
        $isGreaterThanMin = $scraped['value'] >= $minValue;
        if (!$isGreaterThanMin) {
            $formattedMin = number_format($minValue, 2, ',', '.');
            return "Valor da nota fiscal inferior a R$ {$formattedMin}.";
        }

        return null;
    }
}