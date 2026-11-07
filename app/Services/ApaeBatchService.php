<?php

namespace App\Services;

use App\Models\TaxReceipt;
use chillerlan\QRCode\Output\QRGdImagePNG;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Database\Eloquent\Collection;
use ZipArchive;

class ApaeBatchService
{
    /**
     * Gera uma imagem PNG com o QR Code, numeração (1 / n), data e chave impressas embaixo.
     */
    public function generateQrCodePng(
        TaxReceipt $receipt,
        ?int $currentIndex = null,
        ?int $totalInBatch = null
    ): string {
        $url = (string) ($receipt->original_url ?: "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$receipt->access_key}");

        $options = new QROptions([
            'outputInterface' => QRGdImagePNG::class,
            'outputBase64' => false,
            'scale' => 8,
            'imageTransparent' => false,
        ]);

        $qrRaw = (new QRCode($options))->render($url);
        $qrImage = imagecreatefromstring($qrRaw);
        $qrW = imagesx($qrImage);
        $qrH = imagesy($qrImage);

        $hasIndex = $currentIndex !== null && $totalInBatch !== null;
        $canvasW = $qrW + 40;
        $canvasH = $hasIndex ? $qrH + 104 : $qrH + 80;

        $canvas = imagecreatetruecolor($canvasW, $canvasH);
        $white = imagecolorallocate($canvas, 255, 255, 255);
        $textColor = imagecolorallocate($canvas, 15, 23, 42); // #0f172a
        $subColor = imagecolorallocate($canvas, 100, 116, 139); // #64748b

        imagefill($canvas, 0, 0, $white);
        imagecopy($canvas, $qrImage, 20, 16, 0, 0, $qrW, $qrH);

        $dateStr = $receipt->issue_date
            ? $receipt->issue_date->format('d/m/Y')
            : ($receipt->created_at ? $receipt->created_at->format('d/m/Y') : now()->format('d/m/Y'));

        $dateText = "Data: {$dateStr}";
        $cleanKey = (string) $receipt->access_key;
        $keyText = 'Chave: ' . substr($cleanKey, 0, 4) . ' ' . substr($cleanKey, 4, 4) . ' ... ' . substr($cleanKey, -4);

        if ($hasIndex) {
            $indexText = "{$currentIndex} / {$totalInBatch}";
            $fontIndex = 4;
            $indexX = (int) max(4, ($canvasW - (strlen($indexText) * imagefontwidth($fontIndex))) / 2);
            imagestring($canvas, $fontIndex, $indexX, $qrH + 22, $indexText, $textColor);

            $fontDate = 3;
            $dateX = (int) max(4, ($canvasW - (strlen($dateText) * imagefontwidth($fontDate))) / 2);
            imagestring($canvas, $fontDate, $dateX, $qrH + 46, $dateText, $textColor);

            $fontSub = 2;
            $keyX = (int) max(4, ($canvasW - (strlen($keyText) * imagefontwidth($fontSub))) / 2);
            imagestring($canvas, $fontSub, $keyX, $qrH + 70, $keyText, $subColor);
        } else {
            $font = 4;
            $textX = (int) max(4, ($canvasW - (strlen($dateText) * imagefontwidth($font))) / 2);
            imagestring($canvas, $font, $textX, $qrH + 24, $dateText, $textColor);

            $fontSub = 2;
            $keyX = (int) max(4, ($canvasW - (strlen($keyText) * imagefontwidth($fontSub))) / 2);
            imagestring($canvas, $fontSub, $keyX, $qrH + 48, $keyText, $subColor);
        }

        ob_start();
        imagepng($canvas);
        $pngData = ob_get_clean();

        imagedestroy($qrImage);
        imagedestroy($canvas);

        return $pngData;
    }

    /**
     * Gera um arquivo ZIP contendo o CSV e as imagens de QR Code individuais de cada nota.
     */
    public function generateBatchZip(Collection $receipts, string $date): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'apae_zip_');
        $zip = new ZipArchive();
        $zip->open($tempFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        // 1. Resumo em formato CSV
        $csvHeader = "Chave de Acesso,Data de Emissao,Data de Doacao\n";
        $csvRows = '';
        foreach ($receipts as $receipt) {
            $issueDate = $receipt->issue_date ? $receipt->issue_date->format('Y-m-d H:i:s') : '';
            $createdAt = $receipt->created_at ? $receipt->created_at->format('Y-m-d H:i:s') : '';
            $csvRows .= "\"{$receipt->access_key}\",\"{$issueDate}\",\"{$createdAt}\"\n";
        }
        $csvContent = "\xEF\xBB\xBF" . $csvHeader . $csvRows;
        $safeDate = str_replace(['/', '\\'], '-', $date);
        $zip->addFromString("resumo-lote-{$safeDate}.csv", $csvContent);

        // 2. Pasta com as imagens de QR Code individuais
        $totalInBatch = $receipts->count();
        $index = 1;
        foreach ($receipts as $receipt) {
            $pngData = $this->generateQrCodePng($receipt, $index, $totalInBatch);
            $dateSuffix = $receipt->issue_date ? $receipt->issue_date->format('Ymd') : date('Ymd');
            $shortKey = substr((string) $receipt->access_key, -8);
            $padIndex = str_pad((string) $index, 3, '0', STR_PAD_LEFT);
            $filename = "qrcodes/{$padIndex}_nota_{$dateSuffix}_{$shortKey}.png";

            $zip->addFromString($filename, $pngData);
            $index++;
        }

        $zip->close();

        $zipData = file_get_contents($tempFile);
        @unlink($tempFile);

        return $zipData;
    }
}

