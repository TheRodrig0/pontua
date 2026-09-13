<?php

namespace App\Http\Requests;

use App\Enums\RewardTag;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateRewardRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
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
                'required',
                'integer',
                'min:1'
            ],
        ];
    }
}
