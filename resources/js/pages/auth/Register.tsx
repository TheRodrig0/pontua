import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import FeedbackBanner, { FeedbackState } from '@/components/auth/FeedbackBanner';

const Register: React.FC = () => {
    const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
    const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');

    // Cálculo visual de força da senha
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
        if (pass.length < 6) return { score: 1, label: 'Muito curta', color: 'bg-red-500' };
        const hasLetters = /[a-zA-Z]/.test(pass);
        const hasNumbers = /[0-9]/.test(pass);
        const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
        const total = [hasLetters, hasNumbers, hasSpecial].filter(Boolean).length;
        if (pass.length >= 8 && total >= 3) return { score: 3, label: 'Senha Forte', color: 'bg-emerald-500' };
        if (pass.length >= 6 && total >= 2) return { score: 2, label: 'Senha Média', color: 'bg-amber-500' };
        return { score: 1, label: 'Senha Fraca', color: 'bg-red-400' };
    };

    const passwordStrength = getPasswordStrength(regPassword);

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!regName.trim()) {
            errors.regName = 'Informe seu nome completo';
        } else if (regName.trim().length < 3) {
            errors.regName = 'O nome deve ter no mínimo 3 caracteres';
        }

        if (!regEmail.trim()) {
            errors.regEmail = 'Informe seu e-mail FATEC ou pessoal';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
            errors.regEmail = 'Formato de e-mail inválido';
        }

        if (!regPassword) {
            errors.regPassword = 'Crie uma senha de acesso';
        } else if (regPassword.length < 6) {
            errors.regPassword = 'A senha precisa ter no mínimo 6 caracteres';
        }

        if (!regConfirmPassword) {
            errors.regConfirmPassword = 'Confirme sua senha';
        } else if (regPassword !== regConfirmPassword) {
            errors.regConfirmPassword = 'As senhas não coincidem';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setFeedback({
                type: 'error',
                message: 'Por favor, revise os campos destacados antes de continuar.'
            });
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            router.visit('/dashboard');
        }, 500);
    };

    return (
        <AuthLayout currentPage="register">
            <div className="bg-white dark:bg-[#1e2532] rounded-2xl p-6 sm:p-8 shadow-xl border border-[#dbe3ec] dark:border-gray-800 transition-colors">
                {/* Feedback Inline */}
                <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 sm:space-y-4">
                    {/* Campo Nome Completo */}
                    <div>
                        <div
                            className={`bg-[#eff3f6] dark:bg-[#111827] border rounded-xl px-4 py-2.5 sm:py-3 transition-all ${
                                fieldErrors.regName
                                    ? 'border-red-500 ring-2 ring-red-500/20'
                                    : 'border-[#dbe3ec] dark:border-gray-700/80 focus-within:border-[#4bb9a6] focus-within:ring-2 focus-within:ring-[#4bb9a6]/20'
                            }`}
                        >
                            <label className="block text-[10px] sm:text-[11px] font-extrabold text-[#7a889b] dark:text-gray-400 uppercase tracking-wider mb-1">
                                Nome Completo
                            </label>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#7a889b] dark:text-gray-500 shrink-0" />
                                <input
                                    type="text"
                                    value={regName}
                                    onChange={(e) => {
                                        setRegName(e.target.value);
                                        if (fieldErrors.regName) setFieldErrors((prev) => ({ ...prev, regName: '' }));
                                    }}
                                    placeholder="Ex: Maria Clara da Silva"
                                    className="w-full bg-transparent border-none focus:outline-none text-[#3b475c] dark:text-white font-semibold text-xs sm:text-sm placeholder-[#9aa6b8] dark:placeholder-gray-500"
                                    required
                                />
                            </div>
                        </div>
                        {fieldErrors.regName && (
                            <p className="text-[11px] font-semibold text-red-500 dark:text-red-400 mt-1 ml-2">
                                {fieldErrors.regName}
                            </p>
                        )}
                    </div>

                    {/* Campo E-mail FATEC ou Pessoal */}
                    <div>
                        <div
                            className={`bg-[#eff3f6] dark:bg-[#111827] border rounded-xl px-4 py-2.5 sm:py-3 transition-all ${
                                fieldErrors.regEmail
                                    ? 'border-red-500 ring-2 ring-red-500/20'
                                    : 'border-[#dbe3ec] dark:border-gray-700/80 focus-within:border-[#4bb9a6] focus-within:ring-2 focus-within:ring-[#4bb9a6]/20'
                            }`}
                        >
                            <label className="block text-[10px] sm:text-[11px] font-extrabold text-[#7a889b] dark:text-gray-400 uppercase tracking-wider mb-1">
                                E-mail FATEC ou Pessoal
                            </label>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#7a889b] dark:text-gray-500 shrink-0" />
                                <input
                                    type="email"
                                    value={regEmail}
                                    onChange={(e) => {
                                        setRegEmail(e.target.value);
                                        if (fieldErrors.regEmail) setFieldErrors((prev) => ({ ...prev, regEmail: '' }));
                                    }}
                                    placeholder="seu.email@fatec.sp.gov.br"
                                    className="w-full bg-transparent border-none focus:outline-none text-[#3b475c] dark:text-white font-semibold text-xs sm:text-sm placeholder-[#9aa6b8] dark:placeholder-gray-500"
                                    required
                                />
                            </div>
                        </div>
                        {fieldErrors.regEmail && (
                            <p className="text-[11px] font-semibold text-red-500 dark:text-red-400 mt-1 ml-2">
                                {fieldErrors.regEmail}
                            </p>
                        )}
                    </div>

                    {/* Campo Senha com Alternador de Visibilidade */}
                    <div>
                        <div
                            className={`bg-[#eff3f6] dark:bg-[#111827] border rounded-xl px-4 py-2.5 sm:py-3 transition-all ${
                                fieldErrors.regPassword
                                    ? 'border-red-500 ring-2 ring-red-500/20'
                                    : 'border-[#dbe3ec] dark:border-gray-700/80 focus-within:border-[#4bb9a6] focus-within:ring-2 focus-within:ring-[#4bb9a6]/20'
                            }`}
                        >
                            <label className="block text-[10px] sm:text-[11px] font-extrabold text-[#7a889b] dark:text-gray-400 uppercase tracking-wider mb-1">
                                Senha de Acesso (Mínimo 6 caracteres)
                            </label>
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-[#7a889b] dark:text-gray-500 shrink-0" />
                                <input
                                    type={showRegPassword ? 'text' : 'password'}
                                    value={regPassword}
                                    onChange={(e) => {
                                        setRegPassword(e.target.value);
                                        if (fieldErrors.regPassword) setFieldErrors((prev) => ({ ...prev, regPassword: '' }));
                                    }}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-none focus:outline-none text-[#3b475c] dark:text-white font-semibold text-xs sm:text-sm placeholder-[#9aa6b8] dark:placeholder-gray-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowRegPassword(!showRegPassword)}
                                    aria-label={showRegPassword ? 'Ocultar senha' : 'Ver senha'}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer rounded-lg shrink-0"
                                >
                                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Indicador de Força de Senha */}
                        {regPassword.length > 0 && (
                            <div className="mt-2 px-1 flex items-center justify-between">
                                <div className="flex gap-1.5 flex-1 max-w-[140px]">
                                    <div
                                        className={`h-1.5 rounded-full flex-1 transition-all ${
                                            passwordStrength.score >= 1 ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                    />
                                    <div
                                        className={`h-1.5 rounded-full flex-1 transition-all ${
                                            passwordStrength.score >= 2 ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                    />
                                    <div
                                        className={`h-1.5 rounded-full flex-1 transition-all ${
                                            passwordStrength.score >= 3 ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                    />
                                </div>
                                <span className="text-[11px] font-semibold text-[#7a889b] dark:text-gray-400">
                                    {passwordStrength.label}
                                </span>
                            </div>
                        )}

                        {fieldErrors.regPassword && (
                            <p className="text-[11px] font-semibold text-red-500 dark:text-red-400 mt-1 ml-2">
                                {fieldErrors.regPassword}
                            </p>
                        )}
                    </div>

                    {/* Campo Confirmação de Senha */}
                    <div>
                        <div
                            className={`bg-[#eff3f6] dark:bg-[#111827] border rounded-xl px-4 py-2.5 sm:py-3 transition-all ${
                                fieldErrors.regConfirmPassword
                                    ? 'border-red-500 ring-2 ring-red-500/20'
                                    : 'border-[#dbe3ec] dark:border-gray-700/80 focus-within:border-[#4bb9a6] focus-within:ring-2 focus-within:ring-[#4bb9a6]/20'
                            }`}
                        >
                            <label className="block text-[10px] sm:text-[11px] font-extrabold text-[#7a889b] dark:text-gray-400 uppercase tracking-wider mb-1">
                                Confirmar Senha
                            </label>
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-[#7a889b] dark:text-gray-500 shrink-0" />
                                <input
                                    type={showRegConfirmPassword ? 'text' : 'password'}
                                    value={regConfirmPassword}
                                    onChange={(e) => {
                                        setRegConfirmPassword(e.target.value);
                                        if (fieldErrors.regConfirmPassword) setFieldErrors((prev) => ({ ...prev, regConfirmPassword: '' }));
                                    }}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-none focus:outline-none text-[#3b475c] dark:text-white font-semibold text-xs sm:text-sm placeholder-[#9aa6b8] dark:placeholder-gray-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                                    aria-label={showRegConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer rounded-lg shrink-0"
                                >
                                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        {fieldErrors.regConfirmPassword && (
                            <p className="text-[11px] font-semibold text-red-500 dark:text-red-400 mt-1 ml-2">
                                {fieldErrors.regConfirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Termo de Adesão ao Projeto (texto destacado pelo usuário) */}
                    <p className="text-[11px] text-[#7a889b] dark:text-gray-400 leading-relaxed px-1">
                        Ao cadastrar-se, você concorda em doar cupons fiscais do estado de SP para conversão de benefícios pela APAE e pontuação na FATEC.
                    </p>

                    {/* Botão Criar Conta */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#4bb9a6] hover:bg-[#3aa895] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_16px_rgba(75,185,166,0.35)] transition-all text-xs sm:text-sm uppercase tracking-wider cursor-pointer mt-1 active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>CRIAR MINHA CONTA</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                {/* Alternar para Login */}
                <div className="mt-5 text-center border-t border-[#dbe3ec] dark:border-gray-800 pt-5 transition-colors">
                    <p className="text-xs font-medium text-[#7a889b] dark:text-gray-400 mb-2.5">
                        Já tem uma conta cadastrada?
                    </p>
                    <Link
                        href="/login"
                        className="w-full bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800 text-[#3b475c] dark:text-white font-bold py-3 rounded-xl border border-[#dbe3ec] dark:border-gray-700 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider text-center block"
                    >
                        JÁ TENHO UMA CONTA • ENTRAR
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Register;
