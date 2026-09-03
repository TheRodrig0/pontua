<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreTaxReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (!isset($this->url)) {
            return;
        }

        $pattern = '/\d{44}/';
        $accessKey = Str::match($pattern, $this->url);

        if (!$accessKey) {
            return;
        }

        $this->merge(['access_key' => $accessKey]);
    }

    public function rules(): array
    {
        return [
            'url' => [
                'required',
                'string',
                'url',
                'regex:/^https:\/\/(www\.)?(nfce\.)?fazenda\.sp\.gov\.br(\/.*)?$/i',
            ],
            'access_key' => [
                'required',
                'string',
                'size:44',
                'starts_with:35',
                'unique:tax_receipts,access_key',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'url.required' => 'A URL da nota fiscal é obrigatória.',
            'url.url' => 'A URL informada não é válida.',
            'url.regex' => 'A URL informada deve pertencer obrigatoriamente ao portal oficial da SEFAZ-SP (fazenda.sp.gov.br).',
            'access_key.required' => 'O Qrcode desta nota fiscal é inválido.',
            'access_key.size' => 'A chave de acesso deve conter exatamente 44 dígitos numéricos.',
            'access_key.starts_with' => 'Apenas notas fiscais do estado de São Paulo são aceitas.',
            'access_key.unique' => 'Esta nota fiscal já foi inserida no sistema.',
        ];
    }
}