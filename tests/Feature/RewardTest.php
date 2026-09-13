<?php

namespace Tests\Feature;

use App\Enums\RewardTag;
use App\Enums\UserRole;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RewardTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_rewards_endpoints(): void
    {
        $this->getJson('/api/rewards')->assertStatus(401);
        $this->getJson('/api/rewards/1')->assertStatus(401);
        $this->postJson('/api/rewards', [])->assertStatus(401);
        $this->patchJson('/api/rewards/1', [])->assertStatus(401);
        $this->deleteJson('/api/rewards/1')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_active_rewards(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::USER,
        ]);

        Reward::create([
            'name' => 'Camisa Pontua',
            'description' => 'Camisa oficial do projeto',
            'tag' => RewardTag::CLOTHING,
            'cost' => 100,
            'is_active' => true,
        ]);

        Reward::create([
            'name' => 'Item Desativado',
            'description' => 'Não deve aparecer na listagem',
            'tag' => RewardTag::OTHER,
            'cost' => 50,
            'is_active' => false,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/rewards');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Camisa Pontua', $response->json('data.0.name'));
    }

    public function test_authenticated_user_can_view_single_reward(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::USER,
        ]);

        $reward = Reward::create([
            'name' => 'Caneca Pontua',
            'description' => 'Caneca de cerâmica',
            'tag' => RewardTag::OTHER,
            'cost' => 80,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/rewards/{$reward->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $reward->id,
                'name' => 'Caneca Pontua',
                'cost' => 80,
            ]);
    }

    public function test_non_admin_user_cannot_create_update_or_delete_reward(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::USER,
        ]);

        $reward = Reward::create([
            'name' => 'Garrafa Térmica',
            'description' => 'Garrafa 500ml',
            'tag' => RewardTag::OTHER,
            'cost' => 120,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->postJson('/api/rewards', [
                'name' => 'Novo Item',
                'tag' => 'other',
                'cost' => 50,
            ])
            ->assertStatus(403);

        $this->actingAs($user)
            ->patchJson("/api/rewards/{$reward->id}", [
                'name' => 'Tentativa de Update',
            ])
            ->assertStatus(403);

        $this->actingAs($user)
            ->deleteJson("/api/rewards/{$reward->id}")
            ->assertStatus(403);
    }

    public function test_admin_can_create_reward(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create([
            'role' => UserRole::ADMIN,
        ]);

        $payload = [
            'name' => 'Mochila Pontua',
            'description' => 'Mochila para notebook',
            'tag' => RewardTag::OTHER->value,
            'cost' => 300,
            'image' => UploadedFile::fake()->image('mochila.png'),
        ];

        $response = $this->actingAs($admin)
            ->postJson('/api/rewards', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'name' => 'Mochila Pontua',
                'cost' => 300,
            ]);

        $this->assertDatabaseHas('rewards', [
            'name' => 'Mochila Pontua',
            'cost' => 300,
            'is_active' => true,
        ]);
    }

    public function test_create_reward_validates_required_fields(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMIN,
        ]);

        $response = $this->actingAs($admin)
            ->postJson('/api/rewards', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'cost']);
    }

    public function test_admin_can_update_reward(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMIN,
        ]);

        $reward = Reward::create([
            'name' => 'Nome Antigo',
            'description' => 'Desc Antiga',
            'tag' => RewardTag::OTHER,
            'cost' => 100,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->patchJson("/api/rewards/{$reward->id}", [
                'name' => 'Nome Atualizado',
                'cost' => 150,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'id' => $reward->id,
                'name' => 'Nome Atualizado',
                'cost' => 150,
            ]);

        $this->assertDatabaseHas('rewards', [
            'id' => $reward->id,
            'name' => 'Nome Atualizado',
            'cost' => 150,
        ]);
    }

    public function test_admin_can_delete_reward(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::ADMIN,
        ]);

        $reward = Reward::create([
            'name' => 'Item a Deletar',
            'description' => 'Desc',
            'tag' => RewardTag::OTHER,
            'cost' => 50,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->deleteJson("/api/rewards/{$reward->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Recompensa deletada com sucesso.',
            ]);

        $this->assertDatabaseMissing('rewards', [
            'id' => $reward->id,
        ]);
    }
}
