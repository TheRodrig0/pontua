<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateRewardRequest;
use App\Http\Requests\UpdateRewardRequest;
use App\Services\RewardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RewardController extends Controller
{
    public function __construct(
        private readonly RewardService $rewardService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);

        $rewards = $this->rewardService->index(
            perPage: $perPage
        );

        return response()
            ->json($rewards);
    }

    public function show(int $id): JsonResponse
    {
        $reward = $this->rewardService->show(
            id: $id
        );

        return response()
            ->json($reward);
    }

    public function store(CreateRewardRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $reward = $this->rewardService->store(
            data: $validatedData
        );

        return response()
            ->json($reward, 201);
    }

    public function update(UpdateRewardRequest $request, int $id): JsonResponse
    {
        $validatedData = $request->validated();

        $updatedReward = $this->rewardService->update(
            id: $id,
            data: $validatedData
        );

        return response()
            ->json($updatedReward);
    }

    public function destroy(int $id): JsonResponse
    {
        $deletedReward = $this->rewardService->destroy(
            id: $id
        );

        return response()
            ->json($deletedReward);
    }
}
