<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\TaxReceiptService;
use Illuminate\Http\JsonResponse;

class TaxReceiptController extends Controller
{
    public function __construct(
        private readonly TaxReceiptService $taxReceiptService
    ) {
    }

    public function create(array $data): JsonResponse
    {
        return $this->taxReceiptService->create($data);
    }
}
