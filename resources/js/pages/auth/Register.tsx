import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import LogoPontua from '@/components/LogoPontua';
import ThemeToggle from '@/components/ThemeToggle';
import AuthHero from '@/components/auth/AuthHero';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.visit('/dashboard');
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-app-bg dark:bg-app-darkbg text-app-navy dark:text-gray-100 transition-colors relative">
            <Head title="Crie sua conta agora!" />

            {/* Floating theme toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* LEFT SIDE: Reusable Hero Component */}
            <AuthHero />

            {/* RIGHT SIDE: Register Form */}
            <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-10 shadow-app border border-slate-200/80 dark:border-slate-700 transition-colors">
                    {/* Logo & Header */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <Link href="/" className="mb-3 inline-block hover:opacity-95 transition-opacity">
                            <LogoPontua iconSize={44} textClassName="text-2xl font-black tracking-tight text-app-navy dark:text-white" />
                        </Link>

                        <h2 className="text-xl font-bold text-app-navy dark:text-white mb-1 leading-snug">
                            Crie sua conta agora!
                        </h2>
                        <p className="text-xs text-app-graytext dark:text-gray-400 max-w-xs leading-relaxed">
                            Junte-se à comunidade da FATEC e faça a diferença para a APAE.
                        </p>

                        {/* 3 Solidary Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-teal/15 text-app-teal text-[11px] font-semibold border border-app-teal/20">
                                <span>🧾</span> DOE NOTAS
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-coral/15 text-app-coral text-[11px] font-semibold border border-app-coral/20">
                                <span>❤️</span> AJUDE A APAE
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-app-gold/20 text-amber-700 dark:text-app-gold text-[11px] font-semibold border border-app-gold/30">
                                <span>🎁</span> GANHE PRÊMIOS
                            </span>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Field 1: Full Name */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-app-graytext dark:text-gray-400 uppercase tracking-wider">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Maria Clara Silva"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-app-navy dark:text-white placeholder:text-app-graytext/60 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-slate-900 focus:border-app-teal focus:ring-2 focus:ring-app-teal/20 outline-none transition"
                                required
                            />
                        </div>

                        {/* Field 2: Email */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-app-graytext dark:text-gray-400 uppercase tracking-wider">
                                E-mail
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@exemplo.com"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-app-navy dark:text-white placeholder:text-app-graytext/60 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-slate-900 focus:border-app-teal focus:ring-2 focus:ring-app-teal/20 outline-none transition"
                                required
                            />
                        </div>

                        {/* Field 3: Password */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-app-graytext dark:text-gray-400 uppercase tracking-wider">
                                Senha (mínimo 6 caracteres)
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    minLength={6}
                                    className="w-full px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-app-navy dark:text-white placeholder:text-app-graytext/60 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-slate-900 focus:border-app-teal focus:ring-2 focus:ring-app-teal/20 outline-none transition"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-slate-400 hover:text-app-navy dark:hover:text-white cursor-pointer p-1 transition-colors"
                                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-app-teal hover:brightness-95 text-white font-bold rounded-xl shadow-md hover:shadow-lg uppercase tracking-wider text-sm transition-all cursor-pointer active:scale-[0.99]"
                            >
                                Criar Conta
                            </button>
                        </div>

                        {/* Back to Login Button */}
                        <div className="pt-1">
                            <Link
                                href="/login"
                                className="w-full py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-app-navy dark:text-gray-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer text-center block"
                            >
                                Já Tenho uma Conta
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
