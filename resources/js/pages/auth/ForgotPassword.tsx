import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import FeedbackBanner, { FeedbackState } from '@/components/auth/FeedbackBanner';
import AuthInput from '@/components/auth/AuthInput';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        const isEmailEmpty = !email.trim();
        const isEmailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

        if (isEmailEmpty) {
            errors.email = 'Informe o seu e-mail cadastrado';
        } else if (isEmailInvalid) {
            errors.email = 'Insira um formato de e-mail válido';
        }

        const hasValidationErrors = Object.keys(errors).length > 0;
        if (hasValidationErrors) {
            setFieldErrors(errors);
            setFeedback({
                type: 'error',
                message: 'Por favor, insira um e-mail válido para receber o link.',
            });
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);
        setFeedback(null);

        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();
            const isResponseError = !response.ok;

            if (isResponseError) {
                throw new Error(data.message || 'E-mail não encontrado no sistema.');
            }

            setIsSubmitted(true);
        } catch (error: any) {
            setFeedback({
                type: 'error',
                message: error.message || 'Falha ao solicitar recuperação.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout currentPage="forgot-password">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-700/80 transition-colors">
                <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

                {isSubmitted ? (
                    <div className="flex flex-col items-center text-center py-2">
                        <div className="w-14 h-14 bg-app-teal/15 text-app-teal rounded-2xl flex items-center justify-center mb-3.5 shadow-sm">
                            <CheckCircle2 size={32} />
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-app-navy dark:text-white mb-1.5">
                            Link de recuperação enviado!
                        </h3>

                        <p className="text-xs sm:text-sm text-app-graytext dark:text-gray-300 mb-6 leading-relaxed max-w-[320px]">
                            Enviamos as instruções e o link seguro para redefinir sua senha para{' '}
                            <strong className="text-app-navy dark:text-white font-bold">{email}</strong>.
                        </p>

                        <Link
                            href="/login"
                            className="w-full bg-app-teal hover:brightness-95 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-xs sm:text-sm active:scale-[0.99] uppercase tracking-wider flex items-center justify-center gap-2 text-center"
                        >
                            <ArrowLeft size={16} />
                            <span>Voltar para o Login</span>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-xs sm:text-sm text-app-graytext dark:text-gray-300 leading-relaxed">
                            Informe o e-mail cadastrado na sua conta. Vamos gerar e enviar um link para você criar uma nova senha com total segurança.
                        </p>

                        <AuthInput
                            id="forgot-email"
                            label="E-mail Cadastrado"
                            icon={Mail}
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                const hasEmailError = Boolean(fieldErrors.email);
                                if (hasEmailError) {
                                    setFieldErrors((prev) => ({ ...prev, email: '' }));
                                }
                            }}
                            error={fieldErrors.email}
                            placeholder="seu.email@exemplo.com"
                            required
                        />

                        <AuthSubmitButton isSubmitting={isSubmitting}>
                            Enviar link de recuperação
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

export default ForgotPassword;
