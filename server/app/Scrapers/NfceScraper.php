<?php

namespace App\Scrapers;

use App\Enums\TaxReceiptStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;

class NfceScraper
{
    /**
     * @return array{value: ?float, issue_date: ?string, status: TaxReceiptStatus, rejection_reason: ?string}
     */
    public function scrape(string $url): array
    {
        $crawler = $this->fetchCrawler($url);

        if ($crawler->filter('.panelConsulta, #Conteudo_txtChaveAcesso')->count() > 0) {
            return $this->rejected('Link inválido ou nota fiscal não encontrada.');
        }

        if ($crawler->filter('#hdfNotaCancelada')->count() > 0) {
            return $this->rejected('Esta nota fiscal foi cancelada.');
        }

        if ($crawler->filter('#hdfNotaDenegada')->count() > 0) {
            return $this->rejected('Esta nota fiscal foi denegada pela SEFAZ.');
        }

        $value = $this->extractValue($crawler);
        $issueDate = $this->extractIssueDate($crawler);

        if ($value === null || $issueDate === null) {
            return $this->rejected('Falha ao ler os dados estruturais da nota fiscal.');
        }

        return [
            'value' => $value,
            'issue_date' => $issueDate,
            'status' => TaxReceiptStatus::APPROVED,
            'rejection_reason' => null,
        ];
    }

    private function fetchCrawler(string $url): Crawler
    {
        try {
            $response = Http::withoutVerifying()
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ])
                ->timeout(10)
                ->get($url);
        } catch (\Exception) {
            abort(504, 'O portal da SEFAZ demorou muito para responder ou está inacessível.');
        }

        if ($response->status() !== 200) {
            abort(502, 'O portal da SEFAZ está temporariamente indisponível.');
        }

        return new Crawler($response->body());
    }

    private function extractValue(Crawler $crawler): ?float
    {
        $node = $crawler->filter('#totalNota .txtMax');

        if ($node->count() <= 0) {
            return null;
        }

        return str($node->text())
            ->trim()
            ->replace(',', '.')
            ->toFloat();
    }

    private function extractIssueDate(Crawler $crawler): ?string
    {
        $infos = $crawler->filter('#infos');
        if ($infos->count() > 0 && preg_match('/(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/', $infos->text(), $matches)) {
            return Carbon::createFromFormat('d/m/Y H:i:s', $matches[1])
                ->toDateTimeString();
        }

        return null;
    }

    /**
     * @return array{value: null, issue_date: null, status: TaxReceiptStatus, rejection_reason: string}
     */
    private function rejected(string $reason): array
    {
        return [
            'value' => null,
            'issue_date' => null,
            'status' => TaxReceiptStatus::REJECTED,
            'rejection_reason' => $reason,
        ];
    }
}