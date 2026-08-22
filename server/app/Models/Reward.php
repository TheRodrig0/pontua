<?php

namespace App\Models;

use App\Enums\RewardTag;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('rewards')]
#[Fillable([
    'name',
    'description',
    'tag',
    'url_image',
    'cost',
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
            'is_active' => 'boolean',
        ];
    }
}
