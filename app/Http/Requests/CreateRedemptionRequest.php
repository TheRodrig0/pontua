<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateRedemptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reward_id' => [
                'required',
                'integer',
                'exists:rewards,id',
            ],
        ];
    }
}

