<?php

namespace App\Models;

use App\Enums\AchievementType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Table('achievements')]
#[Fillable([
    'name',
    'description',
    'type',
    'url_image',
    'title_text'
])]
class Achievement extends Model
{
    use HasFactory;

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'achievement_user');
    }

    protected function casts(): array
    {
        return [
            'type' => AchievementType::class,
        ];
    }
}
