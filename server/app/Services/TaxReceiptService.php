<?php

namespace App\Services;

use App\Models\TaxReceipt;
use App\Scrapers\NfceScraper;
use App\Enums\TaxReceiptStatus;
use Illuminate\Contracts\Pagination\CursorPaginator;

class TaxReceiptService
{

    public function __construct(
        private readonly NfceScraper $scraper
    ) {

    }

    public function index(int $userId, int $perPage = 5): CursorPaginator
    {
        return TaxReceipt::where('user_id', $userId)
            ->latest('id')
            ->cursorPaginate($perPage);
    }

    public function store(int $userId, array $data): TaxReceipt
    {
        preg_match('/(\d{44})/', $data['url'], $matches);
        $accessKey = $matches[1] ?? null;

        if (!str_starts_with($accessKey, '35')) {
            abort(422, 'Somente notas fiscais de SP são suportadas.');
        }

        if (TaxReceipt::where('access_key', $accessKey)->exists()) {
            abort(422, 'Esta nota fiscal já foi doada.');
        }

        $scraped = $this->scraper->scrape($data['url']);

        if ($scraped['status'] === TaxReceiptStatus::APPROVED && $scraped['value'] < 1.00) {
            abort(422, 'O valor mínimo da nota fiscal para pontuar é de R$ 1,00.');
        }

        $pointsEarned = $scraped['status'] === TaxReceiptStatus::APPROVED
            ? (int) round($scraped['value'])
            : 0;

        return TaxReceipt::create([
            'user_id' => $userId,
            'access_key' => $accessKey,
            'original_url' => $data['url'],
            'points_earned' => $pointsEarned,
            'value' => $scraped['value'],
            'issue_date' => $scraped['issue_date'],
            'status' => $scraped['status'],
            'rejection_reason' => $scraped['rejection_reason'],
        ]);
    }
}