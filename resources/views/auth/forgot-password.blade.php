@extends('layouts.guest')

@section('title', 'PONTUA - Recupere sua senha!')

@section('content')
<div class="min-h-screen w-full flex flex-col lg:flex-row bg-[#eff3f6] dark:bg-[#111827] transition-colors">
    
    <!-- LEFT SIDE: Reusable Hero Component -->
    @include('auth.partials.hero')

    <!-- RIGHT SIDE: Forgot Password Form -->
    <div class="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-3xl p-8 sm:p-10 shadow-app border border-[#e2e8f0]/80 dark:border-[#334155] transition-colors">
            
            <!-- Logo & Title Header -->
            <div class="flex flex-col items-center text-center mb-6">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-11 h-11 rounded-xl bg-[#4bb9a6] flex items-center justify-center text-white font-poppins font-black text-2xl shadow-sm">
                        P
                    </div>
                    <span class="font-poppins font-extrabold text-2xl tracking-tight text-[#273142] dark:text-white">PONTUA<span class="text-[#4bb9a6]">.</span></span>
                </div>

                <h2 class="font-poppins font-bold text-xl text-[#273142] dark:text-white mb-1 leading-snug">
                    Recupere sua senha!
                </h2>
                <p class="text-xs text-[#7a889b] dark:text-slate-400 max-w-xs leading-relaxed">
                    Insira o seu e-mail para receber as instruções e o link de recuperação.
                </p>

                <!-- 3 Solidary Badges / Pills -->
                <div class="flex flex-wrap items-center justify-center gap-2 mt-3.5">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4bb9a6]/10 text-[#2c7a7b] dark:text-[#4bb9a6] text-[11px] font-semibold border border-[#4bb9a6]/20">
                        <span>🧾</span> DOE NOTAS
                    </span>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ea7349]/10 text-[#c05621] dark:text-[#ea7349] text-[11px] font-semibold border border-[#ea7349]/20">
                        <span>❤️</span> AJUDE A APAE
                    </span>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2c84b]/15 text-[#b7791f] dark:text-[#f2c84b] text-[11px] font-semibold border border-[#f2c84b]/30">
                        <span>🎁</span> GANHE PRÊMIOS
                    </span>
                </div>
            </div>

            <!-- Instruction Paragraph -->
            <p class="text-xs text-[#7a889b] dark:text-slate-400 leading-relaxed mb-5 text-center sm:text-left">
                Informe o e-mail cadastrado na sua conta. Vamos gerar e enviar um link para você criar uma nova senha.
            </p>

            <!-- Forgot Password Form -->
            <form action="/login" method="GET" class="space-y-4">
                
                <!-- Field: Registered Email -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-[#7a889b] dark:text-slate-400 uppercase tracking-wider">
                        E-MAIL CADASTRADO
                    </label>
                    <div class="relative flex items-center">
                        <input type="email" 
                               name="email" 
                               placeholder="seu.email@exemplo.com" 
                               class="w-full px-4 py-3 pr-11 bg-[#f8fafc] dark:bg-[#111827] border border-[#e2e8f0] dark:border-[#334155] rounded-xl text-sm text-[#273142] dark:text-white placeholder-[#9aa6b8] dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#111827] focus:border-[#4bb9a6] focus:ring-2 focus:ring-[#4bb9a6]/20 outline-none transition" 
                               required>
                        <div class="absolute right-3.5 text-slate-400 dark:text-slate-500 pointer-events-none p-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="pt-2">
                    <button type="submit" class="w-full py-3.5 bg-[#4bb9a6] hover:bg-[#3da392] text-white font-poppins font-bold rounded-xl shadow-md uppercase tracking-wider text-xs sm:text-sm transition cursor-pointer active:scale-[0.99]">
                        ENVIAR LINK DE RECUPERAÇÃO
                    </button>
                </div>

                <!-- Back to Login Link -->
                <div class="pt-3 text-center">
                    <a href="/login" class="text-xs font-semibold text-[#7a889b] dark:text-slate-400 hover:text-[#4bb9a6] dark:hover:text-[#4bb9a6] transition inline-flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        <span>Voltar para o Login</span>
                    </a>
                </div>

            </form>

        </div>
    </div>

</div>
@endsection
