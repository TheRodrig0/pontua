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

        $isInvalidCredentials = !Auth::attempt($credentials, true);
        if ($isInvalidCredentials) {
            abort(401, 'As credenciais fornecidas estão incorretas.');
        }

        $hasSession = request()->hasSession();
        if ($hasSession) {
            request()->session()
                ->regenerate();
        }

        /** @var User $user */
        $user = Auth::user();

        $token = $user->createToken('auth_token')
            ->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'message' => 'Autenticado com sucesso.',
        ];
    }

    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $user = new User([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);
            $user->role = UserRole::USER;
            $user->save();

            Auth::login($user, true);

            $hasSession = request()->hasSession();
            if ($hasSession) {
                request()->session()
                    ->regenerate();
            }

            $token = $user->createToken('auth_token')
                ->plainTextToken;

            return [
                'user' => $user,
                'token' => $token,
                'message' => 'Cadastro realizado com sucesso.',
            ];
        });
    }

    public function logout(?User $user = null): array
    {
        $currentUser = $user ?? Auth::user();

        if ($currentUser) {
            $currentUser->currentAccessToken()
                    ?->delete();
        }

        $isWebAuthenticated = Auth::guard('web')->check();
        if ($isWebAuthenticated) {
            Auth::guard('web')
                ->logout();
        }

        $hasSession = request()->hasSession();
        if ($hasSession) {
            request()->session()
                ->invalidate();

            request()->session()
                ->regenerateToken();
        }

        return [
            'message' => 'Desconectado com sucesso.',
        ];
    }
}
