<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()
        ->json([
            'status' => 'ok',
            'message' => 'Pontua API is running',
        ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
        ->name('password.reset');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [UserController::class, 'me']);
    Route::put('/me', [UserController::class, 'update']);
    Route::delete('/me', [UserController::class, 'delete']);

    Route::get('/ranking', [RankingController::class, 'index']);
    Route::get('/ranking/my-performance', [RankingController::class, 'myPerformance']);

    Route::get('/donation', [DonationController::class, 'index']);
    Route::post('/donation', [DonationController::class, 'create']);
});
