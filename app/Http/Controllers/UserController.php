<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\DeleteUserRequest;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $me = $this->userService->me(
            user: $user
        );

        return response()
            ->json($me);
    }

    public function update(UpdateUserRequest $request): JsonResponse
    {
        $user = $request->user();
        $validatedRequest = $request->validated();

        $updatedUser = $this->userService->update(
            user: $user,
            data: $validatedRequest
        );

        return response()
            ->json($updatedUser);
    }

    public function delete(DeleteUserRequest $request): JsonResponse
    {
        $user = $request->user();

        $deletedUser = $this->userService->delete($user);

        return response()
            ->json($deletedUser);
    }
}