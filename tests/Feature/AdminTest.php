<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}

