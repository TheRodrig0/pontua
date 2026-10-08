<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthService
{
    public function login(array $data): array
    {
        $credentials = [
            'email' => $data['email'],
            'password' => $data['password'],
        ];

        if (! Auth::attempt($credentials, true)) {
            abort(401, 'As credenciais fornecidas estão incorretas.');
        }

        request()->session()->regenerate();

        return [
            'user' => Auth::user(),
            'message' => 'Autenticado com sucesso.',
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

            Auth::login($user, true);
            request()->session()->regenerate();

            return [
                'user' => $user,
                'message' => 'Cadastro realizado com sucesso.',
            ];
        });
    }

    public function logout(?User $user = null): array
    {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return [
            'message' => 'Desconectado com sucesso.',
        ];
    }
}
