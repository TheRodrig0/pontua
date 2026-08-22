<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('achievements')]
#[Fillable([
    'name',
    'description',
    'url_image',
    'title_text'
])]
class Achievement extends Model
{
    use HasFactory;
}
