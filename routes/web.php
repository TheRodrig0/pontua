<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('LandingPage'));

Route::get('/login', fn() => Inertia::render('auth/Login'))->name('login');
Route::post('/login', [AuthController::class, 'login']);

Route::get('/register', fn() => Inertia::render('auth/Register'));
Route::post('/register', [AuthController::class, 'register']);
Route::get('/cadastro', fn() => redirect('/register'));

Route::get('/forgot-password', fn() => Inertia::render('auth/ForgotPassword'));
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::get('/esqueci-senha', fn() => redirect('/forgot-password'));

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/dashboard', fn() => Inertia::render('DashboardPage'))->name('dashboard');
