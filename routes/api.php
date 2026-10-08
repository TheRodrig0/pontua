<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\RewardController;
use App\Http\Controllers\TaxReceiptController;
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
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:6,1');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
        ->name('password.reset')
        ->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('me')->group(function () {
        Route::get('/', [UserController::class, 'me']);
        Route::patch('/', [UserController::class, 'update']);
        Route::delete('/', [UserController::class, 'delete']);
    });

    Route::prefix('ranking')->group(function () {
        Route::get('/', [RankingController::class, 'index']);
        Route::get('/my-performance', [RankingController::class, 'myPerformance']);
    });

    Route::prefix('donation')->group(function () {
        Route::get('/', [DonationController::class, 'index']);
        Route::post('/', [DonationController::class, 'create'])->middleware('throttle:30,1');
    });

    Route::prefix('tax-receipts')->group(function () {
        Route::get('/', [TaxReceiptController::class, 'index']);
        Route::post('/', [TaxReceiptController::class, 'store'])->middleware('throttle:15,1');
    });

    Route::prefix('rewards')->group(function () {
        Route::get('/', [RewardController::class, 'index']);
        Route::get('/{id}', [RewardController::class, 'show']);

        Route::middleware('can:admin')->group(function () {
            Route::post('/', [RewardController::class, 'store']);
            Route::patch('/{id}', [RewardController::class, 'update']);
            Route::delete('/{id}', [RewardController::class, 'destroy']);
        });
    });
});
