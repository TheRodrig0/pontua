<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create([
            'role' => UserRole::ADMIN,
        ]);
    }

    private function createStudent(): User
    {
        return User::factory()->create([
            'role' => UserRole::USER,
        ]);
    }

    public function test_admin_cannot_demote_themselves(): void
    {
        $admin = $this->createAdmin();
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/users/{$admin->id}", [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => 'user',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);

        $this->assertEquals(UserRole::ADMIN, $admin->fresh()->role);
    }

    public function test_admin_can_update_other_user_role(): void
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/users/{$student->id}", [
            'name' => 'Novo Nome',
            'email' => $student->email,
            'role' => 'admin',
        ]);

        $response->assertStatus(200);
        $this->assertEquals(UserRole::ADMIN, $student->fresh()->role);
    }

    public function test_admin_can_get_and_update_apae_email_setting(): void
    {
        $admin = $this->createAdmin();
        Sanctum::actingAs($admin);

        $getRes = $this->getJson('/api/admin/settings');
        $getRes->assertStatus(200)
            ->assertJsonStructure(['apae_email']);

        $patchRes = $this->patchJson('/api/admin/settings', [
            'apae_email' => 'financeiro@apaefranco.org.br',
        ]);

        $patchRes->assertStatus(200)
            ->assertJson([
                'settings' => [
                    'apae_email' => 'financeiro@apaefranco.org.br',
                ],
            ]);

        $this->assertEquals('financeiro@apaefranco.org.br', Setting::get('apae_email'));
    }

    public function test_non_admin_cannot_access_settings(): void
    {
        $student = $this->createStudent();
        Sanctum::actingAs($student);

        $this->getJson('/api/admin/settings')->assertStatus(403);
        $this->patchJson('/api/admin/settings', ['apae_email' => 'test@test.com'])->assertStatus(403);
    }

    public function test_admin_overview_masks_user_emails_for_privacy(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create([
            'name' => 'Rodrigo Aluno',
            'email' => 'rodrigo.aluno@fatec.sp.gov.br',
            'role' => UserRole::USER,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/overview');
        $response->assertStatus(200);

        $users = collect($response->json('users'));
        $found = $users->firstWhere('id', $student->id);

        $this->assertNotNull($found);
        $this->assertEquals('r***o@fatec.sp.gov.br', $found['email']);
        $this->assertNotEquals('rodrigo.aluno@fatec.sp.gov.br', $found['email']);
    }

    public function test_admin_cannot_change_user_email_or_password(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create([
            'name' => 'Maria Oliveira',
            'email' => 'maria.original@fatec.sp.gov.br',
            'password' => 'senhaOriginal123',
            'role' => UserRole::USER,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/users/{$student->id}", [
            'name' => 'Maria Oliveira',
            'email' => 'hacked@evil.com',
            'password' => 'novaSenhaHackeada999',
            'role' => 'user',
        ]);

        $response->assertStatus(200);

        $freshStudent = $student->fresh();
        $this->assertEquals('maria.original@fatec.sp.gov.br', $freshStudent->email);
        $this->assertTrue(Hash::check('senhaOriginal123', $freshStudent->password));
    }

    public function test_admin_editing_user_name_or_nick_sets_moderation_notice(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create([
            'name' => 'Nome Ofensivo',
            'nick' => 'nick_improprio',
            'role' => UserRole::USER,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/users/{$student->id}", [
            'name' => 'Aluno Moderado',
            'nick' => 'aluno.moderado',
            'role' => 'user',
        ]);

        $response->assertStatus(200);

        $fresh = $student->fresh();
        $this->assertEquals('Aluno Moderado', $fresh->name);
        $this->assertEquals('aluno.moderado', $fresh->nick);
        $this->assertNotNull($fresh->moderation_notice);
        $this->assertStringContainsString('moderação', $fresh->moderation_notice);
    }

    public function test_admin_can_ban_and_unban_user_and_banned_user_cannot_login(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create([
            'email' => 'banido@fatec.sp.gov.br',
            'password' => 'senha12345',
            'role' => UserRole::USER,
        ]);
        $student->createToken('auth_token');

        Sanctum::actingAs($admin);

        $banRes = $this->patchJson("/api/admin/users/{$student->id}", [
            'name' => $student->name,
            'nick' => $student->nick,
            'role' => 'user',
            'is_banned' => true,
            'ban_reason' => 'Violação reiterada das regras do ranking.',
        ]);

        $banRes->assertStatus(200)
            ->assertJsonPath('user.is_banned', true);

        $fresh = $student->fresh();
        $this->assertTrue($fresh->isBanned());
        $this->assertEquals('Violação reiterada das regras do ranking.', $fresh->ban_reason);
        $this->assertEquals(0, $fresh->tokens()->count());

        // Banned user cannot log in
        $loginRes = $this->postJson('/api/auth/login', [
            'email' => 'banido@fatec.sp.gov.br',
            'password' => 'senha12345',
        ]);
        $loginRes->assertStatus(403);

        // Unban user
        Sanctum::actingAs($admin);
        $unbanRes = $this->patchJson("/api/admin/users/{$student->id}", [
            'name' => $student->name,
            'nick' => $student->nick,
            'role' => 'user',
            'is_banned' => false,
        ]);

        $unbanRes->assertStatus(200)
            ->assertJsonPath('user.is_banned', false);

        $this->assertFalse($student->fresh()->isBanned());
    }

    public function test_admin_cannot_ban_themselves(): void
    {
        $admin = $this->createAdmin();
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/users/{$admin->id}", [
            'name' => $admin->name,
            'role' => 'admin',
            'is_banned' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['is_banned']);
    }

    public function test_banned_users_are_hidden_from_ranking(): void
    {
        $activeUser = User::factory()->create([
            'name' => 'Aluno Ativo',
            'banned_at' => null,
        ]);
        $bannedUser = User::factory()->create([
            'name' => 'Aluno Suspenso',
            'banned_at' => now(),
            'ban_reason' => 'Conduta inadequada',
        ]);

        $response = $this->actingAs($activeUser)->getJson('/api/ranking');
        $response->assertStatus(200);

        $ids = collect($response->json())->pluck('id')->all();
        $this->assertContains($activeUser->id, $ids);
        $this->assertNotContains($bannedUser->id, $ids);
    }

    public function test_non_admin_cannot_update_users_or_access_overview(): void
    {
        $student = $this->createStudent();
        $targetUser = $this->createStudent();
        Sanctum::actingAs($student);

        $this->getJson('/api/admin/overview')->assertStatus(403);

        $this->patchJson("/api/admin/users/{$targetUser->id}", [
            'name' => 'Tentativa de Hack',
            'role' => 'admin',
        ])->assertStatus(403);
    }

    public function test_banned_user_cannot_login_using_nickname_or_at_nickname(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create([
            'nick' => 'aluno_suspenso',
            'password' => 'senha12345',
            'role' => UserRole::USER,
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/users/{$student->id}", [
            'name' => $student->name,
            'nick' => $student->nick,
            'role' => 'user',
            'is_banned' => true,
        ])->assertStatus(200);

        // Tentativa 1: login com nick sem arroba
        $res1 = $this->postJson('/api/auth/login', [
            'email' => 'aluno_suspenso',
            'password' => 'senha12345',
        ]);
        $res1->assertStatus(403)
            ->assertJson(['message' => 'Esta conta foi suspensa pela moderação.']);

        // Tentativa 2: login com @nick
        $res2 = $this->postJson('/api/auth/login', [
            'email' => '@aluno_suspenso',
            'password' => 'senha12345',
        ]);
        $res2->assertStatus(403)
            ->assertJson(['message' => 'Esta conta foi suspensa pela moderação.']);
    }

    public function test_banned_user_cannot_access_protected_routes_with_active_session(): void
    {
        $user = User::factory()->create([
            'banned_at' => now(),
            'ban_reason' => 'Suspenso pela moderação.',
        ]);

        $response = $this->actingAs($user)->getJson('/api/me');
        $response->assertStatus(403)
            ->assertJson(['message' => 'Esta conta foi suspensa pela moderação.']);
    }

    public function test_admin_banning_without_reason_uses_default_reason_and_unban_clears_it(): void
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();
        Sanctum::actingAs($admin);

        // Ban sem passar ban_reason
        $banRes = $this->patchJson("/api/admin/users/{$student->id}", [
            'name' => $student->name,
            'role' => 'user',
            'is_banned' => true,
        ]);
        $banRes->assertStatus(200);

        $fresh = $student->fresh();
        $this->assertTrue($fresh->isBanned());
        $this->assertEquals('Suspenso pela moderação.', $fresh->ban_reason);

        // Unban
        $unbanRes = $this->patchJson("/api/admin/users/{$student->id}", [
            'name' => $student->name,
            'role' => 'user',
            'is_banned' => false,
        ]);
        $unbanRes->assertStatus(200);

        $freshAfterUnban = $student->fresh();
        $this->assertFalse($freshAfterUnban->isBanned());
        $this->assertNull($freshAfterUnban->banned_at);
        $this->assertNull($freshAfterUnban->ban_reason);
    }

    public function test_admin_overview_masks_email_in_recent_receipts(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create([
            'email' => 'estudante.fatec@fatec.sp.gov.br',
        ]);

        \App\Models\TaxReceipt::create([
            'user_id' => $student->id,
            'access_key' => '35'.str_repeat('9', 42),
            'value' => 100.00,
            'points_earned' => 100,
            'status' => \App\Enums\TaxReceiptStatus::APPROVED,
            'original_url' => 'https://example.com/receipt',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/overview');
        $response->assertStatus(200);

        $recentReceipts = collect($response->json('recent_receipts'));
        $receipt = $recentReceipts->firstWhere('access_key', '35'.str_repeat('9', 42));

        $this->assertNotNull($receipt);
        $this->assertEquals('e***c@fatec.sp.gov.br', $receipt['user']['email']);
    }

    public function test_admin_updating_only_role_does_not_set_moderation_notice(): void
    {
        $admin = $this->createAdmin();
        $student = User::factory()->create([
            'name' => 'Aluno Fiel',
            'nick' => 'aluno.fiel',
            'moderation_notice' => null,
            'role' => UserRole::USER,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/users/{$student->id}", [
            'name' => 'Aluno Fiel',
            'nick' => 'aluno.fiel',
            'role' => 'admin',
        ]);

        $response->assertStatus(200);
        $fresh = $student->fresh();
        $this->assertEquals(UserRole::ADMIN, $fresh->role);
        $this->assertNull($fresh->moderation_notice);
    }

    public function test_admin_updating_nick_strips_at_symbol_cleanly(): void
    {
        $admin = $this->createAdmin();
        $student = $this->createStudent();
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/admin/users/{$student->id}", [
            'name' => $student->name,
            'nick' => '@novo_nick_limpo',
            'role' => 'user',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('novo_nick_limpo', $student->fresh()->nick);
    }
}

