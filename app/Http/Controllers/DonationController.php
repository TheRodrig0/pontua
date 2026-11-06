<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateDonationRequest;
use App\Services\DonationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function __construct(
        private readonly DonationService $donationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $donations = $this->donationService->index(
            userId: $userId,
        );

        return response()
            ->json($donations);
    }

    public function searchUsers(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $query = (string) $request->query('q', '');

        $users = $this->donationService->searchUsers(
            currentUserId: $userId,
            search: $query,
        );

        return response()->json($users);
    }

    public function create(CreateDonationRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $validatedData = $request->validated();

        $donation = $this->donationService->create(
            userId: $userId,
            data: $validatedData
        );

        return response()
            ->json($donation, 201);
    }
}
