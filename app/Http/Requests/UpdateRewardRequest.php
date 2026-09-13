<?php

namespace App\Http\Requests;

use App\Enums\RewardTag;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRewardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'string',
                'max:50'
            ],

            'description' => [
                'sometimes',
                'string',
                'max:200'
            ],

            'tag' => [
                'sometimes',
                'string',
                Rule::enum(RewardTag::class)
            ],

            'image' => [
                'sometimes',
                'image',
                'mimes:png,jpg,jpeg,webp',
                'max:2048'
            ],

            'cost' => [
                'sometimes',
                'integer',
                'min:1'
            ],

            'is_active' => [
                'sometimes',
                'boolean'
            ],
        ];
    }
}
