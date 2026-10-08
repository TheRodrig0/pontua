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

        $response = Http::withUserAgent($userAgent)
            ->timeout($timeout)
            ->get($url)
            ->throw();

        $body = $response->body();
        $maxBodyBytes = 2 * 1024 * 1024;
        $isPayloadTooLarge = strlen($body) > $maxBodyBytes;
        if ($isPayloadTooLarge) {
            return [
                'status' => SefazReceiptStatus::NOT_FOUND,
                'rejectionReason' => 'Tamanho de resposta da SEFAZ excede o limite de segurança.',
                'value' => 0,
                'issueDate' => null,
            ];
        }

        $crawler = new Crawler($body);

        $errorStatuses = [
            '.panelConsulta, #Conteudo_txtChaveAcesso' => SefazReceiptStatus::NOT_FOUND,
            '#hdfNotaCancelada' => SefazReceiptStatus::CANCELED,
            '#hdfNotaDenegada' => SefazReceiptStatus::DENIED,
        ];

        foreach ($errorStatuses as $selector => $status) {
            $hasError = $crawler->filter($selector)
                ->count() > 0;

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

        $isEmptyText = ! $text;
        if ($isEmptyText) {
            return null;
        }

        $normalized = (string) Str::of($text)
            ->replace('.', '')
            ->replace(',', '.')
            ->trim();

        $isNumeric = is_numeric($normalized);
        if ($isNumeric) {
            return (float) $normalized;
        }

        return null;
    }

    private function extractIssueDate(Crawler $crawler): ?string
    {
        $text = $crawler->filter('#infos')
            ->text('');

        $date = Str::match('/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/', $text);

        $hasDate = (bool) $date;
        if ($hasDate) {
            return Carbon::createFromFormat('d/m/Y H:i:s', $date)
                ->toDateTimeString();
        }

        return null;
    }
}