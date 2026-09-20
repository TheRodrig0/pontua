import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail } from 'lucide-react';
import LogoPontua from '@/components/LogoPontua';
import ThemeToggle from '@/components/ThemeToggle';
import AuthHero from '@/components/auth/AuthHero';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-app-bg dark:bg-app-darkbg text-app-navy dark:text-gray-100 transition-colors relative">
            <Head title="Recupere sua senha!" />

            {/* Floating theme toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* LEFT SIDE: Reusable Hero Component */}
            <AuthHero />

            {/* RIGHT SIDE: Forgot Password Form */}
            <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-10 shadow-app border border-slate-200/80 dark:border-slate-700 transition-colors">
                    {/* Logo & Header */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <Link href="/" className="mb-3 inline-block hover:opacity-95 transition-opacity">
                            <LogoPontua iconSize={44} textClassName="text-2xl font-black tracking-tight text-app-navy dark:text-white" />
                        </Link>

                        <h2 className="text-xl font-bold text-app-navy dark:text-white mb-1 leading-snug">
                            Recupere sua senha!
                        </h2>
                        <p className="text-xs text-app-graytext dark:text-gray-400 max-w-xs leading-relaxed">
                            Insira o seu e-mail para receber as instruções e o link de recuperação.
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

                    {submitted ? (
                        <div className="p-4 rounded-2xl bg-app-teal/10 border border-app-teal/30 text-center space-y-3">
                            <p className="text-sm font-semibold text-app-navy dark:text-white">
                                Link enviado com sucesso!
                            </p>
                            <p className="text-xs text-app-graytext dark:text-gray-300 leading-relaxed">
                                Se houver uma conta associada a <strong>{email}</strong>, você receberá um e-mail com as instruções em instantes.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-xs font-bold text-app-teal hover:underline pt-2"
                            >
                                <ArrowLeft size={14} />
                                <span>Voltar para o login</span>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-xs text-app-graytext dark:text-gray-400 leading-relaxed mb-5 text-center sm:text-left">
                                Informe o e-mail cadastrado na sua conta. Vamos gerar e enviar um link para você criar uma nova senha.
                            </p>

                            {/* Field: Email */}
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-app-graytext dark:text-gray-400 uppercase tracking-wider">
                                    E-mail Cadastrado
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu.email@exemplo.com"
                                        className="w-full px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-app-navy dark:text-white placeholder:text-app-graytext/60 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-slate-900 focus:border-app-teal focus:ring-2 focus:ring-app-teal/20 outline-none transition"
                                        required
                                    />
                                    <div className="absolute right-3.5 text-slate-400 pointer-events-none p-1">
                                        <Mail size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-app-teal hover:brightness-95 text-white font-bold rounded-xl shadow-md hover:shadow-lg uppercase tracking-wider text-xs sm:text-sm transition-all cursor-pointer active:scale-[0.99]"
                                >
                                    Enviar Link de Recuperação
                                </button>
                            </div>

                            {/* Back to Login Link */}
                            <div className="pt-3 text-center">
                                <Link
                                    href="/login"
                                    className="text-xs font-semibold text-app-graytext dark:text-gray-400 hover:text-app-teal dark:hover:text-app-teal transition-colors inline-flex items-center gap-1.5"
                                >
                                    <ArrowLeft size={14} />
                                    <span>Voltar para o Login</span>
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
