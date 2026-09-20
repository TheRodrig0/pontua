<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('LandingPage'));

Route::get('/login', function () {
    return view('auth.login');
});

Route::get('/register', function () {
    return view('auth.register');
});
Route::get('/cadastro', function () {
    return redirect('/register');
});

Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
});
Route::get('/esqueci-senha', function () {
    return redirect('/forgot-password');
});

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

