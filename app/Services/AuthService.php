<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])
            ->first();

        $isValidPassword = Hash::check(
            $data['password'] ?? '',
            $user->password ?? ''
        );

        if (! $user || ! $isValidPassword) {
            abort(401, 'As credenciais fornecidas estão incorretas.');
        }

        $token = $user->createToken('auth_token')
            ->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => UserRole::USER,
            ]);

            $token = $user->createToken('auth_token')
                ->plainTextToken;

            return [
                'user' => $user,
                'token' => $token,
            ];
        });
    }

    public function logout(User $user): array
    {
        $user->currentAccessToken()
            ->delete();

        return [
            'message' => 'Desconectado com sucesso.',
        ];
    }
}
