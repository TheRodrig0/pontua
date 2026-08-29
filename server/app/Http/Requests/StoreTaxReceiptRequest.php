<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaxReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        preg_match("/\d{44}/", $this->url, $matches);

        if (!empty($matches[0])) {
            $this->merge(['access_key' => $matches[0]]);
        }
    }

    public function rules(): array
    {
        return [
            'url' => ['required', 'string', 'regex:/^https?:\/\/[^\s]+$/'],
            'access_key' => [
                'required',
                'string',
                'size:44',
                'starts_with:35',
                'unique:tax_receipts,access_key'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'access_key.required' => 'O Qrcode desta nota fiscal é inválido.',
            'access_key.starts_with' => 'Apenas notas fiscais do estado de São Paulo são aceitas.',
            'access_key.unique' => 'Esta nota fiscal já foi inserida no sistema.',
        ];
    }
}