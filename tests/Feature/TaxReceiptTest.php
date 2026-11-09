<?php

namespace Tests\Feature;

use App\Enums\SefazReceiptStatus;
use App\Enums\TaxReceiptStatus;
use App\Enums\UserRole;
use App\Events\TaxReceiptProcessedEvent;
use App\Http\Requests\StoreTaxReceiptRequest;
use App\Jobs\ProcessTaxReceiptJob;
use App\Models\TaxReceipt;
use App\Models\User;
use App\Scrapers\NfceScraper;
use App\Services\PointService;
use App\Services\TaxReceiptService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Mockery;
use Tests\TestCase;

class TaxReceiptTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_store_tax_receipt_via_service(): void
    {
        Queue::fake();

        $user = User::factory()->create();

        $accessKey = '35' . str_repeat('1', 42);
        $url = "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$accessKey}|2|1|1|abc";

        $scraperMock = Mockery::mock(NfceScraper::class);
        $pointServiceMock = Mockery::mock(PointService::class);

        $service = new TaxReceiptService($scraperMock, $pointServiceMock);
        $receipt = $service->store($user->id, [
            'access_key' => $accessKey,
            'url' => $url,
        ]);

        $this->assertEquals($user->id, $receipt->user_id);
        $this->assertEquals($accessKey, $receipt->access_key);
        $this->assertEquals(TaxReceiptStatus::PENDING, $receipt->status);

        $this->assertDatabaseHas('tax_receipts', [
            'user_id' => $user->id,
            'access_key' => $accessKey,
            'status' => TaxReceiptStatus::PENDING->value,
        ]);

        Queue::assertPushed(ProcessTaxReceiptJob::class);
    }

    public function test_can_list_user_tax_receipts_with_cursor_pagination(): void
    {
        $user = User::factory()->create();

        TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35' . str_repeat('1', 42),
            'value' => 50.00,
            'points_earned' => 50,
            'status' => TaxReceiptStatus::APPROVED,
            'original_url' => 'https://example.com/1',
        ]);

        TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35' . str_repeat('2', 42),
            'value' => 20.00,
            'points_earned' => 20,
            'status' => TaxReceiptStatus::APPROVED,
            'original_url' => 'https://example.com/2',
        ]);

        $scraperMock = Mockery::mock(NfceScraper::class);
        $pointServiceMock = Mockery::mock(PointService::class);

        $service = new TaxReceiptService($scraperMock, $pointServiceMock);
        $paginator = $service->index($user->id, 5);

        $this->assertCount(2, $paginator->items());
    }

    public function test_service_approves_recent_valid_receipt_and_credits_points(): void
    {
        Event::fake([TaxReceiptProcessedEvent::class]);

        $user = User::factory()->create();
        $taxReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35' . str_repeat('3', 42),
            'status' => TaxReceiptStatus::PENDING,
            'value' => 0,
            'points_earned' => 0,
            'original_url' => 'https://example.com/valid',
        ]);

        $scraperMock = Mockery::mock(NfceScraper::class);
        $scraperMock->shouldReceive('scrape')
            ->once()
            ->with((string) $taxReceipt->original_url)
            ->andReturn([
                'status' => SefazReceiptStatus::SUCCESS,
                'value' => 150.75,
                'issueDate' => now()->subDays(5)->toDateTimeString(),
            ]);

        $pointServiceMock = Mockery::mock(PointService::class);
        $pointServiceMock->shouldReceive('credit')
            ->once();

        $service = new TaxReceiptService($scraperMock, $pointServiceMock);
        $service->process($taxReceipt);

        $taxReceipt->refresh();

        $this->assertEquals(TaxReceiptStatus::APPROVED, $taxReceipt->status);
        $this->assertEquals(150.75, (float) $taxReceipt->value);
        $this->assertEquals(151, $taxReceipt->points_earned);
        $this->assertNull($taxReceipt->rejection_reason);

        Event::assertDispatched(TaxReceiptProcessedEvent::class);
    }

    public function test_service_rejects_receipt_older_than_40_days(): void
    {
        Event::fake([TaxReceiptProcessedEvent::class]);

        $user = User::factory()->create();
        $taxReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35' . str_repeat('4', 42),
            'status' => TaxReceiptStatus::PENDING,
            'value' => 0,
            'points_earned' => 0,
            'original_url' => 'https://example.com/old',
        ]);

        $scraperMock = Mockery::mock(NfceScraper::class);
        $scraperMock->shouldReceive('scrape')
            ->once()
            ->with((string) $taxReceipt->original_url)
            ->andReturn([
                'status' => SefazReceiptStatus::SUCCESS,
                'value' => 50.00,
                'issueDate' => now()->subDays(45)->toDateTimeString(),
            ]);

        $pointServiceMock = Mockery::mock(PointService::class);
        $pointServiceMock->shouldNotReceive('credit');

        $service = new TaxReceiptService($scraperMock, $pointServiceMock);
        $service->process($taxReceipt);

        $taxReceipt->refresh();

        $this->assertEquals(TaxReceiptStatus::REJECTED, $taxReceipt->status);
        $this->assertEquals('Nota fiscal com mais de 40 dias de emissão.', $taxReceipt->rejection_reason);
        $this->assertEquals(0, $taxReceipt->points_earned);

        Event::assertDispatched(TaxReceiptProcessedEvent::class);
    }

    public function test_service_rejects_receipt_with_value_under_one_real(): void
    {
        Event::fake([TaxReceiptProcessedEvent::class]);

        $user = User::factory()->create();
        $taxReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35' . str_repeat('5', 42),
            'status' => TaxReceiptStatus::PENDING,
            'value' => 0,
            'points_earned' => 0,
            'original_url' => 'https://example.com/cheap',
        ]);

        $scraperMock = Mockery::mock(NfceScraper::class);
        $scraperMock->shouldReceive('scrape')
            ->once()
            ->with((string) $taxReceipt->original_url)
            ->andReturn([
                'status' => SefazReceiptStatus::SUCCESS,
                'value' => 0.75,
                'issueDate' => now()->subDays(2)->toDateTimeString(),
            ]);

        $pointServiceMock = Mockery::mock(PointService::class);
        $pointServiceMock->shouldNotReceive('credit');

        $service = new TaxReceiptService($scraperMock, $pointServiceMock);
        $service->process($taxReceipt);

        $taxReceipt->refresh();

        $this->assertEquals(TaxReceiptStatus::REJECTED, $taxReceipt->status);
        $this->assertEquals('Valor da nota fiscal inferior a R$ 1,00.', $taxReceipt->rejection_reason);
        $this->assertEquals(0, $taxReceipt->points_earned);

        Event::assertDispatched(TaxReceiptProcessedEvent::class);
    }

    public function test_request_rejects_url_outside_official_sefaz_sp_domain(): void
    {
        $accessKey = '35' . str_repeat('7', 42);
        $maliciousUrl = "https://evil-server.com/fake-sefaz?p={$accessKey}";

        $request = new StoreTaxReceiptRequest();
        $validator = Validator::make([
            'url' => $maliciousUrl,
        ], $request->rules(), $request->messages());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('url', $validator->errors()->toArray());
        $this->assertEquals(
            'O link informado deve pertencer obrigatoriamente ao portal oficial da Nota Fiscal Paulista (fazenda.sp.gov.br).',
            $validator->errors()->first('url')
        );
    }

    public function test_service_store_converts_unique_query_exception_into_validation_exception(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $accessKey = '35' . str_repeat('8', 42);
        $url = "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$accessKey}";

        $scraperMock = Mockery::mock(NfceScraper::class);
        $pointServiceMock = Mockery::mock(PointService::class);

        $service = new TaxReceiptService($scraperMock, $pointServiceMock);

        $service->store($user->id, [
            'access_key' => $accessKey,
            'url' => $url,
        ]);

        $this->expectException(ValidationException::class);

        $service->store($user->id, [
            'access_key' => $accessKey,
            'url' => $url,
        ]);
    }

    public function test_user_can_retry_receipt_rejected_due_to_sefaz_communication_failure(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $receipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35' . str_repeat('9', 42),
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35' . str_repeat('9', 42),
            'status' => TaxReceiptStatus::REJECTED,
            'rejection_reason' => TaxReceiptService::SEFAZ_COMMUNICATION_ERROR_MESSAGE,
            'value' => 0,
            'points_earned' => 0,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tax-receipts/{$receipt->id}/retry");

        $response->assertStatus(202)
            ->assertJson([
                'id' => $receipt->id,
                'status' => TaxReceiptStatus::PENDING->value,
                'rejection_reason' => null,
            ]);

        Queue::assertPushed(ProcessTaxReceiptJob::class);
    }

    public function test_user_cannot_retry_receipt_rejected_due_to_business_rule(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $receipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35' . str_repeat('0', 42),
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35' . str_repeat('0', 42),
            'status' => TaxReceiptStatus::REJECTED,
            'rejection_reason' => 'Nota fiscal com mais de 40 dias de emissão.',
            'value' => 0,
            'points_earned' => 0,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/tax-receipts/{$receipt->id}/retry");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['receipt']);

        Queue::assertNotPushed(ProcessTaxReceiptJob::class);
    }

    public function test_approving_receipt_updates_user_scan_streak_and_longest_streak(): void
    {
        Event::fake([TaxReceiptProcessedEvent::class]);

        $user = User::factory()->create([
            'scan_streak' => 3,
            'longest_streak' => 3,
            'last_scan_date' => now()->subDay()->toDateString(),
        ]);

        $taxReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35111111111111111111111111111111111111111111',
            'status' => TaxReceiptStatus::PENDING,
            'value' => 0,
            'points_earned' => 0,
            'original_url' => 'https://example.com/streak',
        ]);

        $scraperMock = Mockery::mock(NfceScraper::class);
        $scraperMock->shouldReceive('scrape')
            ->once()
            ->andReturn([
                'status' => SefazReceiptStatus::SUCCESS,
                'value' => 25.00,
                'issueDate' => now()->subDay()->toDateTimeString(),
            ]);

        $pointServiceMock = Mockery::mock(PointService::class);
        $pointServiceMock->shouldReceive('credit')->once();

        $service = new TaxReceiptService($scraperMock, $pointServiceMock);
        $service->process($taxReceipt);

        $user->refresh();

        $this->assertEquals(4, $user->scan_streak);
        $this->assertEquals(4, $user->longest_streak);
        $this->assertEquals(now()->toDateString(), $user->last_scan_date->toDateString());
    }

    public function test_user_cannot_retry_another_users_receipt_idor_protection(): void
    {
        Queue::fake();

        $owner = User::factory()->create(['role' => UserRole::USER]);
        $otherUser = User::factory()->create(['role' => UserRole::USER]);

        $receipt = TaxReceipt::create([
            'user_id' => $owner->id,
            'access_key' => '35222222222222222222222222222222222222222222',
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35222222222222222222222222222222222222222222',
            'status' => TaxReceiptStatus::REJECTED,
            'rejection_reason' => TaxReceiptService::SEFAZ_COMMUNICATION_ERROR_MESSAGE,
            'value' => 0,
            'points_earned' => 0,
        ]);

        $response = $this->actingAs($otherUser, 'sanctum')
            ->postJson("/api/tax-receipts/{$receipt->id}/retry");

        $response->assertStatus(404);
        $this->assertEquals(TaxReceiptStatus::REJECTED, $receipt->fresh()->status);
        Queue::assertNotPushed(ProcessTaxReceiptJob::class);
    }

    public function test_admin_can_retry_another_users_receipt(): void
    {
        Queue::fake();

        $owner = User::factory()->create(['role' => UserRole::USER]);
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $receipt = TaxReceipt::create([
            'user_id' => $owner->id,
            'access_key' => '35333333333333333333333333333333333333333333',
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35333333333333333333333333333333333333333333',
            'status' => TaxReceiptStatus::REJECTED,
            'rejection_reason' => TaxReceiptService::SEFAZ_COMMUNICATION_ERROR_MESSAGE,
            'value' => 0,
            'points_earned' => 0,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/tax-receipts/{$receipt->id}/retry");

        $response->assertStatus(202)
            ->assertJson([
                'id' => $receipt->id,
                'status' => TaxReceiptStatus::PENDING->value,
                'rejection_reason' => null,
            ]);

        Queue::assertPushed(ProcessTaxReceiptJob::class);
    }

    public function test_user_cannot_retry_already_approved_or_pending_receipt(): void
    {
        Queue::fake();

        $user = User::factory()->create();

        $approvedReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35444444444444444444444444444444444444444444',
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35444444444444444444444444444444444444444444',
            'status' => TaxReceiptStatus::APPROVED,
            'value' => 50,
            'points_earned' => 50,
        ]);

        $pendingReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35555555555555555555555555555555555555555555',
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35555555555555555555555555555555555555555555',
            'status' => TaxReceiptStatus::PENDING,
            'value' => 0,
            'points_earned' => 0,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/tax-receipts/{$approvedReceipt->id}/retry")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['receipt']);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/tax-receipts/{$pendingReceipt->id}/retry")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['receipt']);

        Queue::assertNotPushed(ProcessTaxReceiptJob::class);
    }

    public function test_first_approved_receipt_initializes_scan_streak_to_one(): void
    {
        Event::fake([TaxReceiptProcessedEvent::class]);

        $user = User::factory()->create([
            'scan_streak' => 0,
            'longest_streak' => 0,
            'last_scan_date' => null,
        ]);

        $taxReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35666666666666666666666666666666666666666666',
            'status' => TaxReceiptStatus::PENDING,
            'value' => 0,
            'points_earned' => 0,
            'original_url' => 'https://example.com/first-streak',
        ]);

        $scraperMock = Mockery::mock(NfceScraper::class);
        $scraperMock->shouldReceive('scrape')->once()->andReturn([
            'status' => SefazReceiptStatus::SUCCESS,
            'value' => 15.00,
            'issueDate' => now()->subDay()->toDateTimeString(),
        ]);

        $pointServiceMock = Mockery::mock(PointService::class);
        $pointServiceMock->shouldReceive('credit')->once();

        (new TaxReceiptService($scraperMock, $pointServiceMock))->process($taxReceipt);

        $user->refresh();
        $this->assertEquals(1, $user->scan_streak);
        $this->assertEquals(1, $user->longest_streak);
        $this->assertEquals(now()->toDateString(), $user->last_scan_date->toDateString());
    }

    public function test_second_approved_receipt_on_same_day_preserves_scan_streak(): void
    {
        Event::fake([TaxReceiptProcessedEvent::class]);

        $user = User::factory()->create([
            'scan_streak' => 3,
            'longest_streak' => 5,
            'last_scan_date' => now()->toDateString(),
        ]);

        $taxReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35777777777777777777777777777777777777777777',
            'status' => TaxReceiptStatus::PENDING,
            'value' => 0,
            'points_earned' => 0,
            'original_url' => 'https://example.com/same-day-streak',
        ]);

        $scraperMock = Mockery::mock(NfceScraper::class);
        $scraperMock->shouldReceive('scrape')->once()->andReturn([
            'status' => SefazReceiptStatus::SUCCESS,
            'value' => 20.00,
            'issueDate' => now()->subDay()->toDateTimeString(),
        ]);

        $pointServiceMock = Mockery::mock(PointService::class);
        $pointServiceMock->shouldReceive('credit')->once();

        (new TaxReceiptService($scraperMock, $pointServiceMock))->process($taxReceipt);

        $user->refresh();
        $this->assertEquals(3, $user->scan_streak);
        $this->assertEquals(5, $user->longest_streak);
        $this->assertEquals(now()->toDateString(), $user->last_scan_date->toDateString());
    }

    public function test_approved_receipt_after_missed_days_resets_scan_streak_to_one_but_preserves_longest_streak(): void
    {
        Event::fake([TaxReceiptProcessedEvent::class]);

        $user = User::factory()->create([
            'scan_streak' => 5,
            'longest_streak' => 10,
            'last_scan_date' => now()->subDays(3)->toDateString(),
        ]);

        $taxReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35888888888888888888888888888888888888888888',
            'status' => TaxReceiptStatus::PENDING,
            'value' => 0,
            'points_earned' => 0,
            'original_url' => 'https://example.com/broken-streak',
        ]);

        $scraperMock = Mockery::mock(NfceScraper::class);
        $scraperMock->shouldReceive('scrape')->once()->andReturn([
            'status' => SefazReceiptStatus::SUCCESS,
            'value' => 30.00,
            'issueDate' => now()->subDay()->toDateTimeString(),
        ]);

        $pointServiceMock = Mockery::mock(PointService::class);
        $pointServiceMock->shouldReceive('credit')->once();

        (new TaxReceiptService($scraperMock, $pointServiceMock))->process($taxReceipt);

        $user->refresh();
        $this->assertEquals(1, $user->scan_streak);
        $this->assertEquals(10, $user->longest_streak);
        $this->assertEquals(now()->toDateString(), $user->last_scan_date->toDateString());
    }

    public function test_rejected_receipt_does_not_alter_user_scan_streak(): void
    {
        Event::fake([TaxReceiptProcessedEvent::class]);

        $yesterday = now()->subDay()->toDateString();
        $user = User::factory()->create([
            'scan_streak' => 3,
            'longest_streak' => 5,
            'last_scan_date' => $yesterday,
        ]);

        $taxReceipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35999999999999999999999999999999999999999991',
            'status' => TaxReceiptStatus::PENDING,
            'value' => 0,
            'points_earned' => 0,
            'original_url' => 'https://example.com/rejected-streak',
        ]);

        $scraperMock = Mockery::mock(NfceScraper::class);
        $scraperMock->shouldReceive('scrape')->once()->andReturn([
            'status' => SefazReceiptStatus::SUCCESS,
            'value' => 0.50,
            'issueDate' => now()->subDay()->toDateTimeString(),
        ]);

        $pointServiceMock = Mockery::mock(PointService::class);
        $pointServiceMock->shouldNotReceive('credit');

        (new TaxReceiptService($scraperMock, $pointServiceMock))->process($taxReceipt);

        $user->refresh();
        $this->assertEquals(3, $user->scan_streak);
        $this->assertEquals(5, $user->longest_streak);
        $this->assertEquals($yesterday, $user->last_scan_date->toDateString());
    }
}
