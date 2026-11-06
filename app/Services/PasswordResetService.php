<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    private const EXPIRES_IN_MINUTES = 60;
    private const THROTTLE_SECONDS = 60;

    public function forgotPassword(array $data): array
    {
        // Resposta sempre idêntica: não revela se o e-mail existe nem se houve throttle.
        $genericResponse = [
            'message' => 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.',
        ];

        $user = User::where('email', $data['email'])->first();

        if (! $user) {
            return $genericResponse;
        }

        $recentRequest = DB::table('password_reset_requests')
            ->where('user_id', $user->id)
            ->where('created_at', '>', now()->subSeconds(self::THROTTLE_SECONDS))
            ->exists();

        if ($recentRequest) {
            return $genericResponse;
        }

        // Selector (public lookup key) + verifier (secret, stored only as a hash).
        $selector = Str::random(24);
        $verifier = Str::random(40);

        DB::transaction(function () use ($user, $selector, $verifier) {
            DB::table('password_reset_requests')->where('user_id', $user->id)->delete();

            DB::table('password_reset_requests')->insert([
                'user_id' => $user->id,
                'selector' => $selector,
                'verifier_hash' => hash('sha256', $verifier),
                'expires_at' => now()->addMinutes(self::EXPIRES_IN_MINUTES),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        $url = route('password.reset', ['token' => $selector . '.' . $verifier]);

        $user->notify(new ResetPasswordNotification($url, self::EXPIRES_IN_MINUTES));

        return $genericResponse;
    }

    public function resetPassword(array $data): array
    {
        $user = DB::transaction(function () use ($data) {
            [$selector, $verifier] = array_pad(explode('.', $data['token'], 2), 2, '');

            $request = DB::table('password_reset_requests')
                ->where('selector', $selector)
                ->lockForUpdate()
                ->first();

            $isValid = $request
                && $verifier !== ''
                && now()->lessThan($request->expires_at)
                && hash_equals($request->verifier_hash, hash('sha256', $verifier));

            if (! $isValid) {
                throw ValidationException::withMessages([
                    'token' => ['O link de redefinição é inválido ou expirou. Solicite um novo.'],
                ]);
            }

            $user = User::findOrFail($request->user_id);

            $user->forceFill([
                'password' => $data['password'],
                'remember_token' => Str::random(60),
            ])->save();

            // Single use: invalidate every pending reset for this user.
            DB::table('password_reset_requests')->where('user_id', $user->id)->delete();

            return $user;
        });

        event(new PasswordReset($user));

        return [
            'message' => 'Sua senha foi redefinida com sucesso!',
        ];
    }
}
