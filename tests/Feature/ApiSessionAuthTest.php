<?php

namespace Tests\Feature;

use App\Enums\TaxReceiptStatus;
use App\Models\TaxReceipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiSessionAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_web_session_can_access_api_me_without_bearer_token(): void
    {
        $user = User::factory()->create();

        // Faz login via web guard (sessão padrão do navegador)
        $response = $this->actingAs($user, 'web')
            ->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJsonPath('email', $user->email)
            ->assertJsonPath('id', $user->id);
    }

    public function test_authenticated_web_session_can_access_api_tax_receipts_without_bearer_token(): void
    {
        $user = User::factory()->create();
        TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35260900000000000000550010000000011000000001',
            'original_url' => 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35260900000000000000550010000000011000000001|2|1|1',
            'status' => TaxReceiptStatus::PENDING,
            'value' => 50.00,
            'points_earned' => 50,
        ]);

        // Faz requisição autenticado apenas via sessão web
        $response = $this->actingAs($user, 'web')
            ->getJson('/api/tax-receipts');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.status', 'pending');
    }

    public function test_unauthenticated_request_is_still_rejected(): void
    {
        $response = $this->getJson('/api/tax-receipts');

        $response->assertStatus(401);
    }
}
