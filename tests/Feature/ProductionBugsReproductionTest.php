<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
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
}
