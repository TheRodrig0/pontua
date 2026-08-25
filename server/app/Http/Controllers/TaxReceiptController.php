<?php

namespace App\Http\Controllers;

use App\Services\TaxReceiptService;
use App\Http\Requests\StoreTaxReceiptRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxReceiptController extends Controller
{
    public function __construct(
        private readonly TaxReceiptService $taxReceiptService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $receipts = $this->taxReceiptService->index(
            userId: $request->user()->id
        );

        return response()
            ->json($receipts);
    }

    public function store(StoreTaxReceiptRequest $request): JsonResponse
    {
        $receipt = $this->taxReceiptService->store(
            userId: $request->user()->id,
            data: $request->validated()
        );

        return response()
            ->json($receipt, 201);
    }
}
