import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import FeedbackBanner, { FeedbackState } from '@/components/auth/FeedbackBanner';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!email.trim()) {
            errors.email = 'Informe o seu e-mail cadastrado';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = 'Insira um formato de e-mail válido';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setFeedback({
                type: 'error',
                message: 'Por favor, insira um e-mail válido para receber o link.'
            });
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 500);
    };

    return (
        <AuthLayout currentPage="forgot-password">
            <div className="bg-white dark:bg-[#1e2532] rounded-2xl p-6 sm:p-8 shadow-xl border border-[#dbe3ec] dark:border-gray-800 transition-colors">
                <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

                {isSubmitted ? (
                    <div className="flex flex-col items-center text-center py-2">
                        <div className="w-14 h-14 bg-[#4bb9a6]/15 text-[#4bb9a6] rounded-2xl flex items-center justify-center mb-3.5 shadow-sm">
                            <CheckCircle2 size={32} />
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-[#3b475c] dark:text-white mb-1.5">
                            Link de recuperação enviado!
                        </h3>

                        <p className="text-xs sm:text-sm text-[#7a889b] dark:text-gray-300 mb-6 leading-relaxed max-w-[320px]">
                            Enviamos as instruções e o link seguro para redefinir sua senha para{' '}
                            <strong className="text-[#3b475c] dark:text-white font-bold">{email}</strong>.
                        </p>

                        <Link
                            href="/login"
                            className="w-full bg-[#4bb9a6] hover:bg-[#3aa895] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_16px_rgba(75,185,166,0.35)] transition-all text-xs sm:text-sm cursor-pointer active:scale-[0.99] uppercase tracking-wider flex items-center justify-center gap-2 text-center"
                        >
                            <ArrowLeft size={16} />
                            <span>Voltar para o Login</span>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-xs sm:text-sm text-[#7a889b] dark:text-gray-300 leading-relaxed">
                            Informe o e-mail cadastrado na sua conta. Vamos gerar e enviar um link para você criar uma nova senha com total segurança.
                        </p>

                        {/* Campo de Entrada de E-mail */}
                        <div>
                            <div
                                className={`bg-[#eff3f6] dark:bg-[#111827] border rounded-xl px-4 py-2.5 sm:py-3 transition-all ${
                                    fieldErrors.email
                                        ? 'border-red-500 ring-2 ring-red-500/20'
                                        : 'border-[#dbe3ec] dark:border-gray-700/80 focus-within:border-[#4bb9a6] focus-within:ring-2 focus-within:ring-[#4bb9a6]/20'
                                }`}
                            >
                                <label className="block text-[10px] sm:text-[11px] font-extrabold text-[#7a889b] dark:text-gray-400 uppercase tracking-wider mb-1">
                                    E-mail Cadastrado
                                </label>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-[#7a889b] dark:text-gray-500 shrink-0" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                                        }}
                                        placeholder="seu.email@exemplo.com"
                                        className="w-full bg-transparent border-none focus:outline-none text-[#3b475c] dark:text-white font-semibold text-xs sm:text-sm placeholder-[#9aa6b8] dark:placeholder-gray-500"
                                        required
                                    />
                                </div>
                            </div>
                            {fieldErrors.email && (
                                <span className="text-[11px] text-red-500 font-medium mt-1 block">
                                    {fieldErrors.email}
                                </span>
                            )}
                        </div>

                        {/* Botão Enviar Link */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#4bb9a6] hover:bg-[#3aa895] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_16px_rgba(75,185,166,0.35)] transition-all text-xs sm:text-sm cursor-pointer active:scale-[0.99] uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>ENVIAR LINK DE RECUPERAÇÃO</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>

                        <div className="pt-2 text-center">
                            <Link
                                href="/login"
                                className="text-xs font-semibold text-[#7a889b] dark:text-gray-400 hover:text-[#4bb9a6] dark:hover:text-[#4bb9a6] transition-colors inline-flex items-center gap-1.5"
                            >
                                <ArrowLeft size={14} />
                                <span>Voltar para o Login</span>
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
