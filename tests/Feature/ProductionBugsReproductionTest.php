<?php

namespace Tests\Feature;

use App\Enums\TaxReceiptStatus;
use App\Jobs\ProcessTaxReceiptJob;
use App\Models\TaxReceipt;
use App\Models\User;
use App\Services\TaxReceiptService;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ProductionBugsReproductionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Fix 1: POST /api/auth/logout não estoura 500 quando autenticado via sessão web.
     */
    public function test_logout_with_session_succeeds_without_error(): void
    {
        $user = User::factory()->create();

        // Autentica via web guard (cookie de sessão / SPA)
        $response = $this->actingAs($user, 'web')
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Desconectado com sucesso.',
            ]);
    }

    /**
     * Fix 1 (variante login com cookie): login por credenciais seguido de logout por cookie.
     */
    public function test_logout_with_cookie_after_login_endpoint_succeeds(): void
    {
        $user = User::factory()->create([
            'email' => 'maria@example.com',
            'password' => 'secret123',
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'maria@example.com',
            'password' => 'secret123',
        ]);

        $loginResponse->assertStatus(200);

        // Sem Bearer token no cabeçalho; usa a sessão criada no login
        $logoutResponse = $this->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200)
            ->assertJson([
                'message' => 'Desconectado com sucesso.',
            ]);
    }

    /**
     * Fix 2: POST /api/tax-receipts com QUEUE_CONNECTION=sync não quebra com 500 se a SEFAZ falhar.
     */
    public function test_tax_receipts_second_submission_handles_sefaz_failure_gracefully_on_sync_queue(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $html = '<html><body>
            <div id="totalNota"><span class="txtMax">50,00</span></div>
            <div id="infos">Emissao: 01/11/2026 12:00:00</div>
        </body></html>';

        $key1 = '35' . str_repeat('1', 42);
        $url1 = "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$key1}";

        $key2 = '35' . str_repeat('2', 42);
        $url2 = "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$key2}";

        // Simula: SEFAZ responde 200 na 1ª requisição, mas bloqueia na 2ª com 429
        Http::fake([
            $url1 => Http::response($html, 200),
            $url2 => Http::response('Bloqueio SEFAZ por taxa de requisicoes', 429),
        ]);

        // Primeira nota salva com sucesso
        $res1 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tax-receipts', ['url' => $url1]);
        $res1->assertStatus(202);

        // Segunda nota é aceita (202) e o job síncrono trata a falha sem estourar 500
        $res2 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tax-receipts', ['url' => $url2]);
        $res2->assertStatus(202);

        // A nota foi atualizada para rejected devido à falha da SEFAZ
        $this->assertDatabaseHas('tax_receipts', [
            'access_key' => $key2,
            'status' => 'rejected',
        ]);
    }

    /**
     * Fix 3: URLs de QR Code da SEFAZ contendo pipes (|) são normalizadas e aceitas.
     */
    public function test_store_tax_receipt_request_accepts_urls_with_pipes_and_normalizes(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $key = '35' . str_repeat('3', 42);
        $urlWithPipe = "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$key}|2|1|1|abc";

        Http::fake([
            '*' => Http::response('<html></html>', 200),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tax-receipts', ['url' => $urlWithPipe]);

        $response->assertStatus(202);
        $this->assertDatabaseHas('tax_receipts', [
            'access_key' => $key,
            'original_url' => "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$key}%7C3%7C1",
        ]);
    }

    /**
     * Fix 4: Usuário pode submeter diretamente os 44 dígitos no campo url.
     */
    public function test_store_tax_receipt_request_accepts_raw_44_digits_key_as_url(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $key = '35' . str_repeat('4', 42);

        Http::fake([
            '*' => Http::response('<html></html>', 200),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tax-receipts', ['url' => $key]);

        $response->assertStatus(202);
        $this->assertDatabaseHas('tax_receipts', [
            'access_key' => $key,
            'original_url' => "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$key}%7C3%7C1",
        ]);
    }

    /**
     * Fix 5: NfceScraper identifica modal de erro spnErroProsseguirMaster da SEFAZ como NOT_FOUND.
     */
    public function test_nfce_scraper_detects_sefaz_qrcode_modal_error_as_not_found(): void
    {
        $key = '35' . str_repeat('5', 42);
        $errorHtml = "<html><body><script>\$('#spnErroProsseguirMaster').html('<ul><li>Problemas na consulta via QR Code</li></ul>');</script></body></html>";

        Http::fake([
            '*' => Http::response($errorHtml, 200),
        ]);

        $scraper = new \App\Scrapers\NfceScraper();
        $result = $scraper->scrape("https://www.nfce.fazenda.sp.gov.br/qrcode?p={$key}%7C3%7C1");

        $this->assertEquals(\App\Enums\SefazReceiptStatus::NOT_FOUND, $result['status']);
    }

    /**
     * Hardening 1: Reciclagem de notas fiscais com falha temporária de comunicação (Deadlock fix).
     */
    public function test_tax_receipt_rejected_due_to_communication_failure_can_be_resubmitted_and_recycled(): void
    {
        Queue::fake([ProcessTaxReceiptJob::class]);

        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $key = '35' . str_repeat('6', 42);
        $url = "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$key}%7C3%7C1";

        // Cria a nota previamente rejeitada por instabilidade na SEFAZ
        $receipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => $key,
            'original_url' => $url,
            'value' => 0,
            'points_earned' => 0,
            'status' => TaxReceiptStatus::REJECTED,
            'rejection_reason' => 'Falha de comunicação com o portal da SEFAZ-SP. Tente novamente mais tarde.',
        ]);

        // Reenvio da mesma nota pelo usuário via API
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tax-receipts', ['url' => $url]);

        $response->assertStatus(202);

        $receipt->refresh();
        $this->assertEquals(TaxReceiptStatus::PENDING, $receipt->status);
        $this->assertNull($receipt->rejection_reason);
        $this->assertEquals(0, $receipt->points_earned);
        $this->assertEquals(0, (float) $receipt->value);

        // Garante que o job de processamento foi redispechado
        Queue::assertPushed(ProcessTaxReceiptJob::class, function ($job) use ($receipt) {
            return true;
        });
    }

    /**
     * Hardening 1b: Notas rejeitadas por regra de negócio legítima continuam bloqueadas com 422.
     */
    public function test_tax_receipt_rejected_due_to_legitimate_business_rule_cannot_be_resubmitted(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $key = '35' . str_repeat('7', 42);
        $url = "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$key}%7C3%7C1";

        TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => $key,
            'original_url' => $url,
            'value' => 50,
            'points_earned' => 0,
            'status' => TaxReceiptStatus::REJECTED,
            'rejection_reason' => 'Nota fiscal com mais de 40 dias de emissão.',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tax-receipts', ['url' => $url]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['access_key']);
    }

    /**
     * Hardening 1c: Notas aprovadas continuam bloqueadas com 422.
     */
    public function test_tax_receipt_approved_cannot_be_resubmitted(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $key = '35' . str_repeat('8', 42);
        $url = "https://www.nfce.fazenda.sp.gov.br/qrcode?p={$key}%7C3%7C1";

        TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => $key,
            'original_url' => $url,
            'value' => 100,
            'points_earned' => 100,
            'status' => TaxReceiptStatus::APPROVED,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tax-receipts', ['url' => $url]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['access_key']);
    }

    /**
     * Hardening 2: Concorrência - process() lança LockTimeoutException se o lock já estiver ocupado.
     */
    public function test_tax_receipt_process_throws_lock_timeout_exception_when_lock_is_busy(): void
    {
        $user = User::factory()->create();
        $receipt = TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35' . str_repeat('9', 42),
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=test',
            'status' => TaxReceiptStatus::PENDING,
            'value' => 0,
            'points_earned' => 0,
        ]);

        // Ocupa o lock previamente
        $lockKey = "process-tax-receipt:{$receipt->id}";
        $lock = Cache::lock($lockKey, 30);
        $this->assertTrue($lock->get());

        try {
            $service = app(TaxReceiptService::class);
            $this->expectException(LockTimeoutException::class);
            $service->process($receipt);
        } finally {
            $lock->release();
        }
    }

    /**
     * Hardening 3: Scraper lança ConnectionException para que fila retente se HTML não contiver dados estruturais.
     */
    public function test_nfce_scraper_throws_connection_exception_on_maintenance_or_missing_structural_data(): void
    {
        $key = '35' . str_repeat('0', 42);
        $maintenanceHtml = '<html><body><div class="msgManutencao">Portal da SEFAZ em manutenção programada.</div></body></html>';

        Http::fake([
            '*' => Http::response($maintenanceHtml, 200),
        ]);

        $scraper = new \App\Scrapers\NfceScraper();

        $this->expectException(ConnectionException::class);
        $scraper->scrape("https://www.nfce.fazenda.sp.gov.br/qrcode?p={$key}%7C3%7C1");
    }

    /**
     * Hardening 4: Job configurado com 3 tentativas e backoff de [5, 15, 30].
     */
    public function test_process_tax_receipt_job_has_optimized_tries_and_backoff(): void
    {
        $receipt = new TaxReceipt();
        $job = new ProcessTaxReceiptJob($receipt);

        $this->assertEquals(3, $job->tries);
        $this->assertEquals([5, 15, 30], $job->backoff);
    }
}
