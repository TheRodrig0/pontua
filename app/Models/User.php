<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'name',
    'nick',
    'email',
    'password',
    'avatar_url',
    'role',
    'banned_at',
    'ban_reason',
    'moderation_notice',
    'scan_streak',
    'longest_streak',
    'last_scan_date',
])]
#[Hidden([
    'password',
    'remember_token'
])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    public function donationsSent(): HasMany
    {
        return $this->hasMany(Donation::class, 'donor_id');
    }

    public function donationsReceived(): HasMany
    {
        return $this->hasMany(Donation::class, 'recipient_id');
    }

    public function taxReceipts(): HasMany
    {
        return $this->hasMany(TaxReceipt::class, 'user_id');
    }

    public function pointBuckets(): HasMany
    {
        return $this->hasMany(PointBucket::class, 'user_id');
    }

    public function pointTransactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class, 'user_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function isUser(): bool
    {
        return $this->role === UserRole::USER;
    }

    public function isBanned(): bool
    {
        return $this->banned_at !== null;
    }

    public function maskedEmail(): string
    {
        $email = (string) $this->email;
        if (! str_contains($email, '@')) {
            return '***';
        }

        [$local, $domain] = explode('@', $email, 2);
        $len = mb_strlen($local);

        if ($len <= 1) {
            $maskedLocal = '*';
        } elseif ($len === 2) {
            $maskedLocal = mb_substr($local, 0, 1) . '*';
        } else {
            $maskedLocal = mb_substr($local, 0, 1) . '***' . mb_substr($local, -1);
        }

        return "{$maskedLocal}@{$domain}";
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'banned_at' => 'datetime',
            'scan_streak' => 'integer',
            'longest_streak' => 'integer',
            'last_scan_date' => 'date',
        ];
    }
}
