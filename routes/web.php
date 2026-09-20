<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('LandingPage'));

Route::get('/login', fn() => Inertia::render('auth/Login'));

Route::get('/register', fn() => Inertia::render('auth/Register'));
Route::get('/cadastro', fn() => redirect('/register'));

Route::get('/forgot-password', fn() => Inertia::render('auth/ForgotPassword'));
Route::get('/esqueci-senha', fn() => redirect('/forgot-password'));

Route::get('/dashboard', function () {
    return view('dashboard');
});

Route::get('/historico', function () {
    return view('historico');
});
Route::get('/extrato', function () {
    return redirect('/historico?tab=extrato');
});

Route::get('/loja', function () {
    return view('store');
});
Route::get('/meus-vouchers', function () {
    return redirect('/loja?tab=vouchers');
});

Route::get('/ranking', function () {
    return view('ranking');
});

Route::get('/sobre', function () {
    return view('about');
});

Route::get('/perfil', function () {
    return view('profile');
});
Route::get('/transferir', function () {
    return view('transferir');
});
Route::get('/transferir-pontos', function () {
    return redirect('/transferir');
});

