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
    'role',
    'avatar_url',
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

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'scan_streak' => 'integer',
            'longest_streak' => 'integer',
            'last_scan_date' => 'date',
        ];
    }
}
