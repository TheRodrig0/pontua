<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $validatedRequest = $request->validated();

        $result = $this->authService->login($validatedRequest);

        return response()
            ->json($result);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $validatedRequest = $request->validated();

        $result = $this->authService->register($validatedRequest);

        return response()
            ->json($result, 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $result = $this->authService->logout($user);

        return response()
            ->json($result);
    }
}
