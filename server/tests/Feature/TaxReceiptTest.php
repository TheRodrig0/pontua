<?php

namespace Tests\Feature;

use App\Enums\SefazReceiptStatus;
use App\Enums\TaxReceiptStatus;
use App\Events\TaxReceiptProcessedEvent;
use App\Jobs\ProcessTaxReceiptJob;
use App\Models\TaxReceipt;
use App\Models\User;
use App\Scrapers\NfceScraper;
use App\Services\PointService;
use App\Services\TaxReceiptService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
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
}
