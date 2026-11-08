<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('nick') && is_string($this->input('nick'))) {
            $cleanNick = ltrim(trim($this->input('nick')), '@');
            $this->merge([
                'nick' => $cleanNick !== '' ? $cleanNick : null,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'string',
                'max:255'
            ],

            'nick' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('users', 'nick')->ignore($this->user()->id)
            ],

            'avatar_id' => [
                'sometimes',
                'integer',
                'between:1,10'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nick.unique' => 'Este apelido já está em uso.',
        ];
    }
}
