@extends('layouts.guest')

@section('title', 'PONTUA - Login & Doação de Notas')

@section('content')
<div class="min-h-screen w-full flex flex-col lg:flex-row bg-[#eff3f6] dark:bg-[#111827] transition-colors">
    
    <!-- LEFT SIDE: Reusable Hero Component -->
    @include('auth.partials.hero')

    <!-- RIGHT SIDE: Auth Card / Form -->
    <div class="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-3xl p-8 sm:p-10 shadow-app border border-[#e2e8f0]/80 dark:border-[#334155] transition-colors">
            
            <!-- Logo Header -->
            <div class="flex flex-col items-center text-center mb-7">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-11 h-11 rounded-xl bg-[#4bb9a6] flex items-center justify-center text-white font-poppins font-black text-2xl shadow-sm">
                        P
                    </div>
                    <span class="font-poppins font-extrabold text-2xl tracking-tight text-[#273142] dark:text-white">PONTUA<span class="text-[#4bb9a6]">.</span></span>
                </div>

                <h2 class="font-poppins font-bold text-xl text-[#273142] dark:text-white mb-1.5 leading-snug">
                    Transforme suas notas em prêmios!
                </h2>
                <p class="text-xs text-[#7a889b] dark:text-slate-400 max-w-xs leading-relaxed">
                    Ajude a APAE escaneando cupons fiscais e ganhe recompensas na FATEC.
                </p>

                <!-- 3 Solidary Badges / Pills -->
                <div class="flex flex-wrap items-center justify-center gap-2 mt-4">
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

            <!-- Login Form -->
            <form action="/dashboard" method="GET" class="space-y-4">
                
                <!-- Field 1: Email or Nickname -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-[#7a889b] dark:text-slate-400 uppercase tracking-wider">
                        E-MAIL OU @NICKNAME
                    </label>
                    <div class="relative flex items-center">
                        <input type="text" 
                               name="login" 
                               placeholder="seu.email@exemplo.com ou @seu_usuario" 
                               class="w-full px-4 py-3 bg-[#f8fafc] dark:bg-[#111827] border border-[#e2e8f0] dark:border-[#334155] rounded-xl text-sm text-[#273142] dark:text-white placeholder-[#9aa6b8] dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#111827] focus:border-[#4bb9a6] focus:ring-2 focus:ring-[#4bb9a6]/20 outline-none transition" 
                               required>
                    </div>
                </div>

                <!-- Field 2: Password with Show/Hide toggle -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-[#7a889b] dark:text-slate-400 uppercase tracking-wider">
                        SENHA
                    </label>
                    <div class="relative flex items-center">
                        <input id="password-field" 
                               type="password" 
                               name="password" 
                               placeholder="••••••••" 
                               class="w-full px-4 py-3 pr-11 bg-[#f8fafc] dark:bg-[#111827] border border-[#e2e8f0] dark:border-[#334155] rounded-xl text-sm text-[#273142] dark:text-white placeholder-[#9aa6b8] dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#111827] focus:border-[#4bb9a6] focus:ring-2 focus:ring-[#4bb9a6]/20 outline-none transition" 
                               required>
                        <button type="button" 
                                id="toggle-password" 
                                class="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1">
                            <svg id="eye-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Forgot Password Link -->
                <div class="flex justify-end pt-0.5">
                    <a href="/forgot-password" class="text-xs font-semibold text-[#4bb9a6] hover:text-[#3da392] hover:underline">
                        Esqueceu a senha?
                    </a>
                </div>

                <!-- Submit Button -->
                <div class="pt-2">
                    <button type="submit" class="w-full py-3.5 bg-[#4bb9a6] hover:bg-[#3da392] text-white font-poppins font-bold rounded-xl shadow-md uppercase tracking-wider text-sm transition cursor-pointer active:scale-[0.99]">
                        ENTRAR
                    </button>
                </div>

                <!-- Divider -->
                <div class="text-center pt-2">
                    <span class="text-xs text-[#7a889b] dark:text-slate-400">Ainda não participa do desafio?</span>
                </div>

                <!-- Create Account Button -->
                <div>
                    <a href="/register" class="w-full py-3 bg-[#f8fafc] dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#111827]/80 border border-[#e2e8f0] dark:border-[#334155] text-[#3b475c] dark:text-slate-200 font-poppins font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer text-center block">
                        CRIAR NOVA CONTA
                    </a>
                </div>

            </form>

        </div>
    </div>

</div>

<!-- Password toggle script -->
<script>
    document.getElementById('toggle-password')?.addEventListener('click', function () {
        const passwordField = document.getElementById('password-field');
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
        } else {
            passwordField.type = 'password';
        }
    });
</script>
@endsection
