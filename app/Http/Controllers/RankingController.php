<?php

namespace App\Http\Controllers;

use App\Services\RankingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    public function __construct(
        private readonly RankingService $rankingService
    ) {}

    public function index(): JsonResponse
    {
        $ranking = $this->rankingService->index();

        return response()
            ->json($ranking);
    }

    public function myPerformance(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $performance = $this->rankingService->myPerformance(
            userId: $userId
        );

        return response()
            ->json($performance);
    }
}
