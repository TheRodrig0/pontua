<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_successfully(): void
    {
        $payload = [
            'name' => 'Rodrigo Teste',
            'email' => 'rodrigo@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'rodrigo@example.com',
            'name' => 'Rodrigo Teste',
        ]);
    }

    public function test_registration_validates_required_fields(): void
    {
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_registration_fails_with_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'rodrigo@example.com',
        ]);

        $payload = [
            'name' => 'Outro Rodrigo',
            'email' => 'rodrigo@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_fails_when_passwords_do_not_match(): void
    {
        $payload = [
            'name' => 'Rodrigo Teste',
            'email' => 'rodrigo@example.com',
            'password' => 'password123',
            'password_confirmation' => 'diferente123',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'rodrigo@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'rodrigo@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
                'token',
            ]);
    }

    public function test_login_fails_with_incorrect_password(): void
    {
        User::factory()->create([
            'email' => 'rodrigo@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'rodrigo@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_fails_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'inexistente@example.com',
            'password' => 'qualquer-coisa',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_logout_and_revoke_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Desconectado com sucesso.',
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_unauthenticated_user_cannot_logout(): void
    {
        $response = $this->postJson('/api/auth/logout');

        $response->assertStatus(401);
    }

    public function test_can_request_forgot_password_link(): void
    {
        $user = User::factory()->create([
            'email' => 'rodrigo@example.com',
        ]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'rodrigo@example.com',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('password_reset_requests', [
            'user_id' => $user->id,
        ]);
    }

    public function test_forgot_password_does_not_reveal_unregistered_email(): void
    {
        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'naoexiste@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message']);

        $this->assertDatabaseCount('password_reset_requests', 0);
    }

    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'rodrigo@example.com',
            'password' => 'antiga123',
        ]);

        $token = $this->issueResetToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'password' => 'novaSenha123',
            'password_confirmation' => 'novaSenha123',
        ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertTrue(Hash::check('novaSenha123', $user->password));
        $this->assertDatabaseCount('password_reset_requests', 0);
    }

    public function test_reset_token_is_single_use(): void
    {
        $user = User::factory()->create();
        $token = $this->issueResetToken($user);

        $payload = [
            'token' => $token,
            'password' => 'novaSenha123',
            'password_confirmation' => 'novaSenha123',
        ];

        $this->postJson('/api/auth/reset-password', $payload)->assertStatus(200);
        $this->postJson('/api/auth/reset-password', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['token']);
    }

    public function test_reset_fails_with_wrong_verifier_or_expired_token(): void
    {
        $user = User::factory()->create();
        $token = $this->issueResetToken($user);
        [$selector] = explode('.', $token);

        $this->postJson('/api/auth/reset-password', [
            'token' => $selector . '.' . str_repeat('x', 40),
            'password' => 'novaSenha123',
            'password_confirmation' => 'novaSenha123',
        ])->assertStatus(422)->assertJsonValidationErrors(['token']);

        \Illuminate\Support\Facades\DB::table('password_reset_requests')
            ->update(['expires_at' => now()->subMinute()]);

        $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'password' => 'novaSenha123',
            'password_confirmation' => 'novaSenha123',
        ])->assertStatus(422)->assertJsonValidationErrors(['token']);
    }

    public function test_login_issues_token_that_expires_in_one_day_and_no_remember_cookie(): void
    {
        $user = User::factory()->create([
            'email' => 'rodrigo@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'rodrigo@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);

        $cookies = $response->headers->getCookies();
        foreach ($cookies as $cookie) {
            $this->assertStringStartsNotWith('remember_web_', $cookie->getName());
        }

        $tokenModel = $user->tokens()->first();
        $this->assertNotNull($tokenModel);
        $this->assertNotNull($tokenModel->expires_at);
        $this->assertTrue(
            $tokenModel->expires_at->between(now()->addHours(23), now()->addHours(25))
        );

        $plainToken = $response->json('token');

        \Illuminate\Support\Facades\Auth::forgetGuards();
        $this->flushSession();
        $this->travel(25)->hours();

        $this->withHeader('Authorization', 'Bearer ' . $plainToken)
            ->getJson('/api/me')
            ->assertStatus(401);
    }

    private function issueResetToken(User $user): string
    {
        $selector = \Illuminate\Support\Str::random(24);
        $verifier = \Illuminate\Support\Str::random(40);

        \Illuminate\Support\Facades\DB::table('password_reset_requests')->insert([
            'user_id' => $user->id,
            'selector' => $selector,
            'verifier_hash' => hash('sha256', $verifier),
            'expires_at' => now()->addHour(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $selector . '.' . $verifier;
    }
}
