<?php

namespace App\Http\Controllers;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    public function __construct(
        private readonly PasswordResetService $passwordResetService
    ) {
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $validatedRequest = $request->validated();

        $result = $this->passwordResetService->forgotPassword(
            data: $validatedRequest
        );

        return response()
            ->json($result);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $validatedRequest = $request->validated();

        $result = $this->passwordResetService->resetPassword(
            data: $validatedRequest
        );

        return response()
            ->json($result);
    }
}
