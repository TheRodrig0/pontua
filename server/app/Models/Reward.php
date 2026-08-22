<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('rewards')]
#[Fillable([
    'name',
    'description',
    'url_image',
    'cost',
    'is_active'
])]
class Reward extends Model
{
    //
}
