<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('LandingPage'))->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', fn() => Inertia::render('auth/Login'))->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::get('/register', fn() => Inertia::render('auth/Register'))->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::get('/cadastro', fn() => redirect()->route('register'));

    Route::get('/forgot-password', fn() => Inertia::render('auth/ForgotPassword'))->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->name('password.email')->middleware('throttle:6,1');
    Route::get('/esqueci-senha', fn() => redirect()->route('password.request'));
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/dashboard', fn() => Inertia::render('DashboardPage'))->name('dashboard');
});
