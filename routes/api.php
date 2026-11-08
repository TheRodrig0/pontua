<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\RedemptionController;
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
        ->name('api.password.reset')
        ->middleware('throttle:6,1');

    Route::middleware('auth:sanctum,web')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum,web')->group(function () {
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
        Route::get('/users', [DonationController::class, 'searchUsers'])->middleware('throttle:30,1');
        Route::post('/', [DonationController::class, 'create'])->middleware('throttle:30,1');
    });

    Route::prefix('tax-receipts')->group(function () {
        Route::get('/', [TaxReceiptController::class, 'index']);
        Route::post('/', [TaxReceiptController::class, 'store'])->middleware('throttle:15,1');
        Route::post('/{id}/retry', [TaxReceiptController::class, 'retry'])->middleware('throttle:15,1');
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

    Route::prefix('redemptions')->group(function () {
        Route::get('/', [RedemptionController::class, 'index']);
        Route::post('/', [RedemptionController::class, 'create'])->middleware('throttle:10,1');
    });

    Route::prefix('admin')->middleware('can:admin')->group(function () {
        Route::get('/overview', [AdminController::class, 'overview']);
        Route::patch('/users/{id}', [AdminController::class, 'updateUser']);
        Route::get('/redemptions', [AdminController::class, 'redemptions']);
        Route::patch('/redemptions/{id}', [AdminController::class, 'updateRedemption'])->middleware('throttle:60,1');
        Route::get('/settings', [AdminController::class, 'getSettings']);
        Route::patch('/settings', [AdminController::class, 'updateSettings']);
        Route::post('/apae-batch/send', [AdminController::class, 'sendApaeBatch'])->middleware('throttle:5,1');
        Route::get('/apae-batch/download', [AdminController::class, 'downloadApaeBatch'])->middleware('throttle:10,1');
    });
});
