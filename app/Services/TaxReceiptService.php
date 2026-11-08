<?php

namespace App\Services;

use App\Events\TaxReceiptProcessedEvent;
use App\Models\TaxReceipt;
use App\Models\User;
use App\Scrapers\NfceScraper;
use Illuminate\Contracts\Pagination\CursorPaginator;
use App\Jobs\ProcessTaxReceiptJob;
use App\Enums\TaxReceiptStatus;
use Illuminate\Support\Facades\DB;
use App\Enums\SefazReceiptStatus;
use App\Enums\PointTransactionSource;
use Illuminate\Support\Facades\Cache;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class TaxReceiptService
{
    public const SEFAZ_COMMUNICATION_ERROR_MESSAGE = 'Falha de comunicação com o portal da SEFAZ-SP. Tente novamente mais tarde.';

    public function __construct(
        private readonly NfceScraper $nfceScraper,
        private readonly PointService $pointService
    ) {
    }

    public function index(int $userId, int $perPage = 5): CursorPaginator
    {
        $taxReceipt = TaxReceipt::where('user_id', $userId)
            ->latest('id')
            ->cursorPaginate($perPage);

        return $taxReceipt;
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

    /**
     * @throws ValidationException
     */
    public function retry(int $receiptId, int $userId, bool $isAdmin = false): TaxReceipt
    {
        $receipt = DB::transaction(function () use ($receiptId, $userId, $isAdmin) {
            $query = TaxReceipt::where('id', $receiptId)->lockForUpdate();
            if (! $isAdmin) {
                $query->where('user_id', $userId);
            }

            $lockedReceipt = $query->firstOrFail();

            if ($lockedReceipt->status !== TaxReceiptStatus::REJECTED) {
                throw ValidationException::withMessages([
                    'receipt' => ['Apenas notas fiscais rejeitadas por falha de comunicação podem ser reprocessadas.'],
                ]);
            }

            $isRetriable = $lockedReceipt->rejection_reason === self::SEFAZ_COMMUNICATION_ERROR_MESSAGE;
            if (! $isRetriable) {
                throw ValidationException::withMessages([
                    'receipt' => ['Esta nota fiscal foi recusada por regra de validação da SEFAZ e não pode ser reprocessada.'],
                ]);
            }

            $lockedReceipt->update([
                'status' => TaxReceiptStatus::PENDING,
                'rejection_reason' => null,
            ]);

            return $lockedReceipt;
        });

        ProcessTaxReceiptJob::dispatch($receipt)
            ->afterCommit();

        return $receipt;
    }

    public function process(TaxReceipt $taxReceipt): void
    {
        $lockKey = "process-tax-receipt:{$taxReceipt->id}";
        $seconds = 30;
        $lock = Cache::lock($lockKey, $seconds);

        if (!$lock->get()) {
            throw new LockTimeoutException("Não foi possível adquirir o lock para processar a nota fiscal {$taxReceipt->id}.");
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

                if ($status === TaxReceiptStatus::APPROVED) {
                    $this->updateUserScanStreak($lockedReceipt->user_id);
                }

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

    private function updateUserScanStreak(int $userId): void
    {
        $user = User::where('id', $userId)
            ->lockForUpdate()
            ->first();

        if (! $user) {
            return;
        }

        $today = now()->startOfDay();
        $lastScanDate = $user->last_scan_date
            ? Carbon::parse($user->last_scan_date)->startOfDay()
            : null;

        $currentStreak = (int) $user->scan_streak;

        if ($lastScanDate && $lastScanDate->equalTo($today)) {
            $newStreak = max(1, $currentStreak);
        } elseif ($lastScanDate && $lastScanDate->equalTo($today->copy()->subDay())) {
            $newStreak = $currentStreak + 1;
        } else {
            $newStreak = 1;
        }

        $longestStreak = max((int) $user->longest_streak, $newStreak);

        $user->update([
            'scan_streak' => $newStreak,
            'longest_streak' => $longestStreak,
            'last_scan_date' => $today->toDateString(),
        ]);

        Cache::forget('ranking_top_10');
        Cache::forget("ranking_performance_{$userId}");
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