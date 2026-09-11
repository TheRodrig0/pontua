<?php

namespace Tests\Feature;

use App\Enums\PointBucketStatus;
use App\Enums\TaxReceiptStatus;
use App\Enums\UserRole;
use App\Models\PointBucket;
use App\Models\TaxReceipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_profile_routes(): void
    {
        $this->getJson('/api/me')->assertStatus(401);
        $this->putJson('/api/me', ['name' => 'Novo Nome'])->assertStatus(401);
        $this->deleteJson('/api/me', ['password' => 'password'])->assertStatus(401);
    }

    public function test_user_can_get_profile_with_initial_metrics(): void
    {
        $user = User::factory()->create([
            'name' => 'Rodrigo Silva',
            'email' => 'rodrigo@example.com',
            'nick' => 'rodrigo.silva',
            'role' => UserRole::USER,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'name' => 'Rodrigo Silva',
                'email' => 'rodrigo@example.com',
                'nick' => 'rodrigo.silva',
                'role' => UserRole::USER->value,
                'current_balance' => 0,
                'expiring_soon_points' => 0,
                'total_receipts' => 0,
            ]);
    }

    public function test_user_can_get_profile_with_calculated_points_and_approved_receipts(): void
    {
        $user = User::factory()->create();

        PointBucket::create([
            'user_id' => $user->id,
            'initial_points' => 100,
            'remaining_points' => 100,
            'expires_at' => now()->addDays(60),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        PointBucket::create([
            'user_id' => $user->id,
            'initial_points' => 50,
            'remaining_points' => 50,
            'expires_at' => now()->addDays(10),
            'status' => PointBucketStatus::ACTIVE,
        ]);

        PointBucket::create([
            'user_id' => $user->id,
            'initial_points' => 30,
            'remaining_points' => 30,
            'expires_at' => now()->subDay(),
            'status' => PointBucketStatus::EXPIRED,
        ]);

        TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35'.str_repeat('1', 42),
            'value' => 50.00,
            'points_earned' => 50,
            'status' => TaxReceiptStatus::APPROVED,
            'original_url' => 'https://example.com/1',
        ]);

        TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35'.str_repeat('2', 42),
            'value' => 30.00,
            'points_earned' => 30,
            'status' => TaxReceiptStatus::APPROVED,
            'original_url' => 'https://example.com/2',
        ]);

        TaxReceipt::create([
            'user_id' => $user->id,
            'access_key' => '35'.str_repeat('3', 42),
            'value' => 20.00,
            'points_earned' => 0,
            'status' => TaxReceiptStatus::REJECTED,
            'original_url' => 'https://example.com/3',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'current_balance' => 150,
                'expiring_soon_points' => 50,
                'total_receipts' => 2,
            ]);
    }

    public function test_user_can_update_name_and_nick(): void
    {
        $user = User::factory()->create([
            'name' => 'Nome Antigo',
            'nick' => 'nick.antigo',
        ]);

        $response = $this->actingAs($user)
            ->putJson('/api/me', [
                'name' => 'Nome Novo',
                'nick' => 'nick.novo',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'Nome Novo',
                'nick' => 'nick.novo',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nome Novo',
            'nick' => 'nick.novo',
        ]);
    }

    public function test_user_can_update_avatar_id_and_sets_avatar_url(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/me', [
                'avatar_id' => 3,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'avatar_url' => asset('avatars/3.png'),
        ]);
    }

    public function test_update_validates_avatar_id_range(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/me', [
                'avatar_id' => 99,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['avatar_id']);
    }

    public function test_update_fails_with_duplicate_nick(): void
    {
        User::factory()->create([
            'nick' => 'outro.nick',
        ]);

        $user = User::factory()->create([
            'nick' => 'meu.nick',
        ]);

        $response = $this->actingAs($user)
            ->putJson('/api/me', [
                'nick' => 'outro.nick',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nick']);
    }

    public function test_user_can_keep_same_nick_on_update(): void
    {
        $user = User::factory()->create([
            'nick' => 'mesmo.nick',
        ]);

        $response = $this->actingAs($user)
            ->putJson('/api/me', [
                'name' => 'Novo Nome',
                'nick' => 'mesmo.nick',
            ]);

        $response->assertStatus(200);
    }

    public function test_user_can_delete_account_with_correct_password_and_revokes_tokens(): void
    {
        $user = User::factory()->create([
            'password' => 'minhasenha123',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson('/api/me', [
                'password' => 'minhasenha123',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Conta deletada com sucesso.',
            ]);

        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_user_cannot_delete_account_with_wrong_password(): void
    {
        $user = User::factory()->create([
            'password' => 'minhasenha123',
        ]);

        $response = $this->actingAs($user)
            ->deleteJson('/api/me', [
                'password' => 'senha_errada',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
        ]);
    }
}
