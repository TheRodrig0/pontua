<?php

namespace Tests\Feature;

use App\Enums\TaxReceiptStatus;
use App\Enums\UserRole;
use App\Jobs\SendApaeDailyBatchJob;
use App\Mail\ApaeDailyBatchMail;
use App\Models\TaxReceipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ApaeBatchTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(): User
    {
        return User::factory()->create(['role' => UserRole::USER]);
    }

    public function test_job_does_nothing_when_no_pending_receipts(): void
    {
        Mail::fake();

        (new SendApaeDailyBatchJob())->handle();

        Mail::assertNothingSent();
    }

    public function test_job_sends_batch_email_and_marks_receipts_as_sent(): void
    {
        Mail::fake();

        $user = $this->createUser();

        $receipt1 = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35240900000000000000550010000000011000000001',
            'value' => 150.50,
            'points_earned' => 151,
            'status' => TaxReceiptStatus::APPROVED,
            'issue_date' => now()->subDay(),
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=1',
        ]);

        $receipt2 = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35240900000000000000550010000000021000000002',
            'value' => 49.50,
            'points_earned' => 50,
            'status' => TaxReceiptStatus::APPROVED,
            'issue_date' => now()->subHours(5),
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=2',
        ]);

        // Recibo rejeitado que não deve entrar no lote
        $rejectedReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35240900000000000000550010000000031000000003',
            'value' => 20.00,
            'points_earned' => 0,
            'status' => TaxReceiptStatus::REJECTED,
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=3',
        ]);

        (new SendApaeDailyBatchJob())->handle();

        Mail::assertQueued(ApaeDailyBatchMail::class, function (ApaeDailyBatchMail $mail) {
            $this->assertEquals(2, $mail->totalReceipts);

            $attachments = $mail->attachments();
            $this->assertCount(1, $attachments);

            return true;
        });
        
        $this->assertNotNull($receipt1->fresh()->sent_to_apae_at);
        $this->assertNotNull($receipt2->fresh()->sent_to_apae_at);
        $this->assertNull($rejectedReceipt->fresh()->sent_to_apae_at);
    }

    public function test_apae_daily_batch_mail_renders_clean_template(): void
    {
        $user = $this->createUser();

        $receipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35240900000000000000550010000000011000000001',
            'value' => 88.00,
            'points_earned' => 88,
            'status' => TaxReceiptStatus::APPROVED,
            'issue_date' => now(),
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=1',
        ]);

        $mail = new ApaeDailyBatchMail(
            receipts: TaxReceipt::where('id', $receipt->id)->get(),
            date: '07/11/2026',
            totalReceipts: 1
        );

        $rendered = $mail->render();

        $this->assertStringContainsString('PONTUA', $rendered);
        $this->assertStringContainsString('07/11/2026', $rendered);
        $this->assertStringContainsString('Cupons Validados no Lote', $rendered);
        $this->assertStringNotContainsString('88,00', $rendered);
    }

    public function test_batch_service_generates_valid_zip_with_qr_code_images(): void
    {
        $user = $this->createUser();

        $receipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35240900000000000000550010000000011000000001',
            'value' => 75.00,
            'points_earned' => 75,
            'status' => TaxReceiptStatus::APPROVED,
            'issue_date' => now(),
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35240900000000000000550010000000011000000001|2|1|1|token',
        ]);

        $service = app(\App\Services\ApaeBatchService::class);
        $zipData = $service->generateBatchZip(TaxReceipt::where('id', $receipt->id)->get(), '07/11/2026');

        $this->assertNotEmpty($zipData);

        // Verifica se é um arquivo ZIP válido
        $tempFile = tempnam(sys_get_temp_dir(), 'test_zip_');
        file_put_contents($tempFile, $zipData);

        $zip = new \ZipArchive();
        $this->assertTrue($zip->open($tempFile));
        $this->assertGreaterThanOrEqual(2, $zip->numFiles);

        $csvContent = $zip->getFromName('resumo-lote-07-11-2026.csv');
        $this->assertNotFalse($csvContent);
        $this->assertStringContainsString('35240900000000000000550010000000011000000001', $csvContent);
        $this->assertStringNotContainsString('75.00', $csvContent);

        $pngData = $zip->getFromIndex(1); // Segunda entrada (QR code PNG)
        $this->assertNotFalse($pngData);
        // Header de PNG válido: \x89PNG\r\n\x1a\n
        $this->assertStringStartsWith("\x89PNG\r\n\x1a\n", $pngData);

        $zip->close();
        unlink($tempFile);
    }

    public function test_admin_can_manually_send_and_download_apae_batch(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $user = $this->createUser();

        $receipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35240900000000000000550010000000011000000099',
            'value' => 120.00,
            'points_earned' => 120,
            'status' => TaxReceiptStatus::APPROVED,
            'issue_date' => now()->subHours(2),
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35240900000000000000550010000000011000000099',
        ]);

        // 1. Download manual do ZIP
        $downloadResponse = $this->actingAs($admin, 'sanctum')
            ->get('/api/admin/apae-batch/download');

        $downloadResponse->assertStatus(200);
        $this->assertEquals('application/zip', $downloadResponse->headers->get('Content-Type'));
        $this->assertNotEmpty($downloadResponse->getContent());

        // 2. Disparo manual por e-mail
        $sendResponse = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/apae-batch/send');

        $sendResponse->assertStatus(200)
            ->assertJson([
                'total_receipts' => 1,
            ]);

        Mail::assertQueued(ApaeDailyBatchMail::class);
        $this->assertNotNull($receipt->fresh()->sent_to_apae_at);
    }

    public function test_non_admin_cannot_access_manual_apae_batch_endpoints(): void
    {
        $user = $this->createUser();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/admin/apae-batch/send')
            ->assertStatus(403);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/apae-batch/download')
            ->assertStatus(403);
    }

    public function test_manual_apae_batch_endpoints_return_422_when_no_approved_receipts_exist(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $user = $this->createUser();

        TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35240900000000000000550010000000011000000077',
            'value' => 10.00,
            'points_earned' => 0,
            'status' => TaxReceiptStatus::REJECTED,
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=77',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/apae-batch/send')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['batch']);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/apae-batch/download')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['batch']);

        Mail::assertNothingQueued();
    }

    public function test_manual_apae_batch_fallback_returns_already_sent_approved_receipts_without_overwriting_timestamp(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $user = $this->createUser();
        $originalSentAt = now()->subDays(2)->startOfSecond();

        $receipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35240900000000000000550010000000011000000088',
            'value' => 80.00,
            'points_earned' => 80,
            'status' => TaxReceiptStatus::APPROVED,
            'issue_date' => now()->subDays(3),
            'sent_to_apae_at' => $originalSentAt,
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=88',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->get('/api/admin/apae-batch/download')
            ->assertStatus(200);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/apae-batch/send')
            ->assertStatus(200)
            ->assertJson(['total_receipts' => 1]);

        Mail::assertQueued(ApaeDailyBatchMail::class);
        $this->assertEquals(
            $originalSentAt->toDateTimeString(),
            $receipt->fresh()->sent_to_apae_at->toDateTimeString()
        );
    }

    public function test_manual_apae_batch_prioritizes_unsent_approved_receipts_over_already_sent(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $user = $this->createUser();

        TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35240900000000000000550010000000011000000081',
            'value' => 40.00,
            'points_earned' => 40,
            'status' => TaxReceiptStatus::APPROVED,
            'issue_date' => now()->subDays(2),
            'sent_to_apae_at' => now()->subDay(),
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=81',
        ]);

        $unsentReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35240900000000000000550010000000011000000082',
            'value' => 60.00,
            'points_earned' => 60,
            'status' => TaxReceiptStatus::APPROVED,
            'issue_date' => now()->subHours(3),
            'sent_to_apae_at' => null,
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=82',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/apae-batch/send')
            ->assertStatus(200)
            ->assertJson(['total_receipts' => 1]);

        $this->assertNotNull($unsentReceipt->fresh()->sent_to_apae_at);
    }
}
