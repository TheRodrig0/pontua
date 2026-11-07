<?php

namespace App\Models;

use App\Enums\RewardTag;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('rewards')]
#[Fillable([
    'name',
    'description',
    'tag',
    'url_image',
    'cost',
    'stock',
    'is_active'
])]
class Reward extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'tag' => RewardTag::class,
            'cost' => 'integer',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected function urlImage(): Attribute
    {
        return Attribute::make(
            get: function (?string $value): ?string {
                if (! $value) {
                    return null;
                }

                // Se contiver /storage/, retorna como caminho relativo seguro contra mixed content
                if (str_contains($value, '/storage/')) {
                    $relativePath = substr($value, strpos($value, '/storage/') + 9);

                    return '/storage/' . ltrim($relativePath, '/');
                }

                // Se for um caminho relativo sem /storage/ inicial (ex: rewards/img.jpg)
                if (! str_starts_with($value, 'http://') && ! str_starts_with($value, 'https://') && ! str_starts_with($value, '/')) {
                    return '/storage/' . ltrim($value, '/');
                }

                return $value;
            }
        );
    }
}
