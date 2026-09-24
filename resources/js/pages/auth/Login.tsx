import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import FeedbackBanner, { FeedbackState } from '@/components/auth/FeedbackBanner';

const Login: React.FC = () => {
    const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            router.visit('/dashboard');
        }, 250);
    };

    return (
        <AuthLayout currentPage="login">
            <div className="bg-white dark:bg-[#1e2532] rounded-2xl p-6 sm:p-8 shadow-xl border border-[#dbe3ec] dark:border-gray-800 transition-colors">
                {/* Banner de Feedback */}
                <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Input E-mail / Nickname */}
                    <div>
                        <div className="bg-[#eff3f6] dark:bg-[#111827] border border-[#dbe3ec] dark:border-gray-700/80 rounded-xl px-4 py-2.5 sm:py-3 focus-within:border-[#4bb9a6] focus-within:ring-2 focus-within:ring-[#4bb9a6]/20 transition-all">
                            <label className="block text-[10px] sm:text-[11px] font-extrabold text-[#7a889b] dark:text-gray-400 uppercase tracking-wider mb-1">
                                E-mail ou @Nickname
                            </label>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#7a889b] dark:text-gray-500 shrink-0" />
                                <input
                                    type="text"
                                    value={loginIdentifier}
                                    onChange={(e) => setLoginIdentifier(e.target.value)}
                                    placeholder="seu.email@exemplo.com ou @seu_usuario"
                                    className="w-full bg-transparent border-none focus:outline-none text-[#3b475c] dark:text-white font-semibold text-xs sm:text-sm placeholder-[#9aa6b8] dark:placeholder-gray-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Input Senha */}
                    <div>
                        <div className="bg-[#eff3f6] dark:bg-[#111827] border border-[#dbe3ec] dark:border-gray-700/80 rounded-xl px-4 py-2.5 sm:py-3 focus-within:border-[#4bb9a6] focus-within:ring-2 focus-within:ring-[#4bb9a6]/20 transition-all">
                            <label className="block text-[10px] sm:text-[11px] font-extrabold text-[#7a889b] dark:text-gray-400 uppercase tracking-wider mb-1">
                                Senha
                            </label>
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-[#7a889b] dark:text-gray-500 shrink-0" />
                                <input
                                    type={showLoginPassword ? 'text' : 'password'}
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-none focus:outline-none text-[#3b475c] dark:text-white font-semibold text-xs sm:text-sm placeholder-[#9aa6b8] dark:placeholder-gray-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    aria-label={showLoginPassword ? 'Ocultar senha' : 'Ver senha'}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer rounded-lg shrink-0"
                                >
                                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Esqueceu a Senha */}
                    <div className="flex justify-end pt-0.5">
                        <Link
                            href="/forgot-password"
                            className="text-xs font-bold text-[#4bb9a6] hover:text-[#3aa895] hover:underline transition-all cursor-pointer bg-transparent border-none p-0"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>

                    {/* Botão Entrar */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#4bb9a6] hover:bg-[#3aa895] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_16px_rgba(75,185,166,0.35)] transition-all text-xs sm:text-sm cursor-pointer active:scale-[0.99] uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>ENTRAR NA PLATAFORMA</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                {/* Alternar para Cadastro */}
                <div className="mt-5 text-center border-t border-[#dbe3ec] dark:border-gray-800 pt-5 transition-colors">
                    <p className="text-xs font-medium text-[#7a889b] dark:text-gray-400 mb-2.5">
                        Ainda não tem conta no PONTUA?
                    </p>
                    <Link
                        href="/register"
                        className="w-full bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800 text-[#3b475c] dark:text-white font-bold py-3 rounded-xl border border-[#dbe3ec] dark:border-gray-700 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider text-center block"
                    >
                        CRIAR CONTA GRATUITAMENTE
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Login;
