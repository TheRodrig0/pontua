<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaxReceiptRequest;
use App\Services\TaxReceiptService;
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
        $userId = $request->user()->id;

        $receipts = $this->taxReceiptService->index(
            userId: $userId
        );

        return response()
            ->json($receipts);
    }

    public function store(StoreTaxReceiptRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $validatedRequest = $request->validated();

        $receipt = $this->taxReceiptService->store(
            userId: $userId,
            data: $validatedRequest
        );

        return response()
            ->json($receipt, 202);
    }
}