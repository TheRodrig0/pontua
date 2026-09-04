<?php

namespace App\Scrapers;

use App\Enums\SefazReceiptStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Symfony\Component\DomCrawler\Crawler;

class NfceScraper
{
    public function scrape(string $url): array
    {
        $timeout = 10;
        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

        $response = Http::withoutVerifying()
            ->withUserAgent($userAgent)
            ->timeout($timeout)
            ->get($url)
            ->throw();

        $crawler = new Crawler($response->body());

        $errorStatuses = [
            '.panelConsulta, #Conteudo_txtChaveAcesso' => SefazReceiptStatus::NOT_FOUND,
            '#hdfNotaCancelada' => SefazReceiptStatus::CANCELED,
            '#hdfNotaDenegada' => SefazReceiptStatus::DENIED,
        ];

        foreach ($errorStatuses as $selector => $status) {
            $hasError = $crawler->filter($selector)->count() > 0;

            if ($hasError) {
                return [
                    'status' => $status,
                    'rejectionReason' => $status->message(),
                    'value' => 0,
                    'issueDate' => null,
                ];
            }
        }

        return [
            'status' => SefazReceiptStatus::SUCCESS,
            'rejectionReason' => null,
            'value' => $this->extractValue($crawler),
            'issueDate' => $this->extractIssueDate($crawler),
        ];
    }

    private function extractValue(Crawler $crawler): ?float
    {
        $text = $crawler->filter('#totalNota .txtMax')
            ->text('');

        if (!$text) {
            return null;
        }

        $normalized = (string) Str::of($text)
            ->replace('.', '')
            ->replace(',', '.')
            ->trim();

        if (is_numeric($normalized)) {
            return (float) $normalized;
        }

        return null;
    }

    private function extractIssueDate(Crawler $crawler): ?string
    {
        $text = $crawler->filter('#infos')
            ->text('');

        $date = Str::match('/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/', $text);

        if ($date) {
            return Carbon::createFromFormat('d/m/Y H:i:s', $date)
                ->toDateTimeString();
        }

        return null;
    }
}