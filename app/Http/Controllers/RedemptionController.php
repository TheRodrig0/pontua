<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateRedemptionRequest;
use App\Services\RedemptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RedemptionController extends Controller
{
    public function __construct(
        private readonly RedemptionService $redemptionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $redemptions = $this->redemptionService->indexForUser(
            userId: $request->user()->id
        );

        // Não expõe user_id, processed_by nem dados internos ao aluno.
        $redemptions->through(fn($redemption) => $redemption->only([
            'id',
            'voucher_code',
            'status',
            'points_cost',
            'created_at',
            'redeemed_at',
            'reward',
        ]));

        return response()
            ->json($redemptions);
    }

    public function create(CreateRedemptionRequest $request): JsonResponse
    {
        $redemption = $this->redemptionService->create(
            userId: $request->user()->id,
            rewardId: (int) $request->validated()['reward_id']
        );

        return response()
            ->json($redemption->only([
                'id',
                'voucher_code',
                'status',
                'points_cost',
                'created_at',
                'reward',
            ]), 201);
    }
}

