@extends('layouts.guest')

@section('title', 'PONTUA - Crie sua conta agora!')

@section('content')
<div class="min-h-screen w-full flex flex-col lg:flex-row bg-[#eff3f6]">
    
    <!-- LEFT SIDE: Reusable Hero Component -->
    @include('auth.partials.hero')

    <!-- RIGHT SIDE: Register Form -->
    <div class="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-app border border-[#e2e8f0]/80">
            
            <!-- Logo & Title Header -->
            <div class="flex flex-col items-center text-center mb-6">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-11 h-11 rounded-xl bg-[#4bb9a6] flex items-center justify-center text-white font-poppins font-black text-2xl shadow-sm">
                        P
                    </div>
                    <span class="font-poppins font-extrabold text-2xl tracking-tight text-[#273142]">PONTUA<span class="text-[#4bb9a6]">.</span></span>
                </div>

                <h2 class="font-poppins font-bold text-xl text-[#273142] mb-1 leading-snug">
                    Crie sua conta agora!
                </h2>
                <p class="text-xs text-[#7a889b] max-w-xs leading-relaxed">
                    Junte-se à comunidade da FATEC e faça a diferença para a APAE.
                </p>

                <!-- 3 Solidary Badges / Pills -->
                <div class="flex flex-wrap items-center justify-center gap-2 mt-3.5">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4bb9a6]/10 text-[#2c7a7b] text-[11px] font-semibold border border-[#4bb9a6]/20">
                        <span>🧾</span> DOE NOTAS
                    </span>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ea7349]/10 text-[#c05621] text-[11px] font-semibold border border-[#ea7349]/20">
                        <span>❤️</span> AJUDE A APAE
                    </span>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2c84b]/15 text-[#b7791f] text-[11px] font-semibold border border-[#f2c84b]/30">
                        <span>🎁</span> GANHE PRÊMIOS
                    </span>
                </div>
            </div>

            <!-- Registration Form -->
            <form action="/dashboard" method="GET" class="space-y-4">
                
                <!-- Field 1: Full Name -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-[#7a889b] uppercase tracking-wider">
                        NOME COMPLETO
                    </label>
                    <div class="relative flex items-center">
                        <input type="text" 
                               name="name" 
                               placeholder="Ex: Maria Clara Silva" 
                               class="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm text-[#273142] placeholder-[#9aa6b8] focus:bg-white focus:border-[#4bb9a6] focus:ring-2 focus:ring-[#4bb9a6]/20 outline-none transition" 
                               required>
                    </div>
                </div>

                <!-- Field 2: E-mail -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-[#7a889b] uppercase tracking-wider">
                        E-MAIL
                    </label>
                    <div class="relative flex items-center">
                        <input type="email" 
                               name="email" 
                               placeholder="email@exemplo.com" 
                               class="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm text-[#273142] placeholder-[#9aa6b8] focus:bg-white focus:border-[#4bb9a6] focus:ring-2 focus:ring-[#4bb9a6]/20 outline-none transition" 
                               required>
                    </div>
                </div>

                <!-- Field 3: Password with Show/Hide toggle -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-[#7a889b] uppercase tracking-wider">
                        SENHA (MÍNIMO 6 CARACTERES)
                    </label>
                    <div class="relative flex items-center">
                        <input id="register-password" 
                               type="password" 
                               name="password" 
                               placeholder="••••••••" 
                               minlength="6"
                               class="w-full px-4 py-3 pr-11 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm text-[#273142] placeholder-[#9aa6b8] focus:bg-white focus:border-[#4bb9a6] focus:ring-2 focus:ring-[#4bb9a6]/20 outline-none transition" 
                               required>
                        <button type="button" 
                                id="toggle-register-password" 
                                class="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="pt-2">
                    <button type="submit" class="w-full py-3.5 bg-[#4bb9a6] hover:bg-[#3da392] text-white font-poppins font-bold rounded-xl shadow-md uppercase tracking-wider text-sm transition cursor-pointer active:scale-[0.99]">
                        CRIAR CONTA
                    </button>
                </div>

                <!-- Back to Login Button -->
                <div class="pt-1">
                    <a href="/login" class="w-full py-3 bg-[#f8fafc] hover:bg-slate-100 border border-[#e2e8f0] text-[#3b475c] font-poppins font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer text-center block">
                        JÁ TENHO UMA CONTA
                    </a>
                </div>

            </form>

        </div>
    </div>

</div>

<!-- Password toggle script -->
<script>
    document.getElementById('toggle-register-password')?.addEventListener('click', function () {
        const passwordField = document.getElementById('register-password');
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
        } else {
            passwordField.type = 'password';
        }
    });
</script>
@endsection
