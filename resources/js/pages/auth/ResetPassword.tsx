import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Lock, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import FeedbackBanner, { FeedbackState } from '@/components/auth/FeedbackBanner';
import AuthInput from '@/components/auth/AuthInput';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import { authService } from '@/services/authService';

interface ResetPasswordProps {
    token?: string;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token: propToken }) => {
    const [token, setToken] = useState(() => {
        if (propToken) {
            return propToken;
        }
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('token') || '';
        }
        return '';
    });
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResetDone, setIsResetDone] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const effectiveToken = propToken || token;

        if (effectiveToken) {
            if (!token) {
                setToken(effectiveToken);
            }
            if (window.location.search.includes('token=')) {
                // Remove o token da barra de endereço para não vazar no histórico nem no Referer
                window.history.replaceState(null, '', window.location.pathname);
            }
        } else {
            setFeedback({
                type: 'error',
                message: 'Link de redefinição inválido. Solicite um novo link de recuperação.',
            });
        }
    }, [propToken]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!token.trim()) {
            setFeedback({
                type: 'error',
                message: 'Link de redefinição inválido ou expirado. Solicite um novo link de recuperação.',
            });
            return;
        }

        if (password.length < 8) {
            errors.password = 'A nova senha deve ter no mínimo 8 caracteres.';
        }

        if (password !== passwordConfirmation) {
            errors.passwordConfirmation = 'As senhas informadas não coincidem.';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setFeedback({
                type: 'error',
                message: 'Verifique os campos destacados abaixo.',
            });
            return;
        }

        setFieldErrors({});
        setFeedback(null);
        setIsSubmitting(true);

        try {
            await authService.resetPassword({
                token: token.trim(),
                password,
                password_confirmation: passwordConfirmation,
            });
            setIsResetDone(true);
        } catch (error: any) {
            setFeedback({
                type: 'error',
                message: error.message || 'Falha ao redefinir a senha.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout currentPage="reset-password">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-700/80 transition-colors">
                <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

                {isResetDone ? (
                    <div className="flex flex-col items-center text-center py-2">
                        <div className="w-14 h-14 bg-app-teal/15 text-app-teal rounded-2xl flex items-center justify-center mb-3.5 shadow-sm">
                            <CheckCircle2 size={32} />
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-app-navy dark:text-white mb-1.5">
                            Senha redefinida com sucesso!
                        </h3>

                        <p className="text-xs sm:text-sm text-app-graytext dark:text-gray-300 mb-6 leading-relaxed max-w-[320px]">
                            Sua nova senha já está ativa. Use-a para acessar a sua conta.
                        </p>

                        <Link
                            href="/login"
                            className="w-full bg-app-teal hover:brightness-95 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-xs sm:text-sm active:scale-[0.99] uppercase tracking-wider flex items-center justify-center gap-2 text-center"
                        >
                            <span>Acessar minha conta</span>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <AuthInput
                                id="reset-password"
                                label="Nova Senha (Mínimo 8 Caracteres)"
                                icon={Lock}
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (fieldErrors.password) {
                                        setFieldErrors((prev) => ({ ...prev, password: '' }));
                                    }
                                }}
                                error={fieldErrors.password}
                                placeholder="••••••••"
                                required
                            />
                            <PasswordStrengthMeter password={password} />
                        </div>

                        <AuthInput
                            id="reset-password-confirmation"
                            label="Confirmar Nova Senha"
                            icon={Lock}
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => {
                                setPasswordConfirmation(e.target.value);
                                if (fieldErrors.passwordConfirmation) {
                                    setFieldErrors((prev) => ({ ...prev, passwordConfirmation: '' }));
                                }
                            }}
                            error={fieldErrors.passwordConfirmation}
                            placeholder="••••••••"
                            required
                        />

                        <AuthSubmitButton isSubmitting={isSubmitting}>
                            Salvar nova senha
                        </AuthSubmitButton>

                        <div className="pt-2 text-center">
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
        </AuthLayout>
    );
};

export default ResetPassword;
