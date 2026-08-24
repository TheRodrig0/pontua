<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\TaxReceiptService;
use App\Http\Requests\StoreTaxReceiptRequest;
use Illuminate\Http\JsonResponse;

class TaxReceiptController extends Controller
{
    public function __construct(
        private readonly TaxReceiptService $taxReceiptService
    ) {
    }

    public function create(StoreTaxReceiptRequest $request): JsonResponse
    {
        $receipt = $this->taxReceiptService->create($request->validated());

        return response()
            ->json($receipt, 201);
    }
}
