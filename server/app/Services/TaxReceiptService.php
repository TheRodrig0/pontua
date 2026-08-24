<?php

namespace App\Services;

use App\Models\TaxReceipt;
use App\Scrapers\NfceScraper;
use App\Enums\TaxReceiptStatus;

class TaxReceiptService
{

    public function __construct(
        private readonly NfceScraper $scraper
    ) {

    }

    public function create(array $data): TaxReceipt
    {
        preg_match('/(\d{44})/', $data['url'], $matches);
        $accessKey = $matches[1] ?? null;

        if (!str_starts_with($accessKey, '35')) {
            abort(422, 'Somente notas fiscais de SP são suportadas.');
        }

        if (TaxReceipt::where('access_key', $accessKey)->exists()) {
            abort(422, 'Esta nota fiscal já foi doada.');
        }

        $taxReceiptScrapedInfos = $this->scraper->scrape($data['url']);

        $pointsEarned = 0;
        if ($taxReceiptScrapedInfos['status'] === TaxReceiptStatus::APPROVED) {
            $pointsEarned = (int) round($taxReceiptScrapedInfos['value']);
        }

        $receipt = TaxReceipt::create([
            'user_id' => $data['user_id'],
            'access_key' => $accessKey,
            'value' => $taxReceiptScrapedInfos['value'],
            'points_earned' => $pointsEarned,
            'issue_date' => $taxReceiptScrapedInfos['issue_date'],
            'status' => $taxReceiptScrapedInfos['status'],
            'rejection_reason' => $taxReceiptScrapedInfos['rejection_reason'],
            'original_url' => $data['url'],
        ]);

        return $receipt;
    }
}