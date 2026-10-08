import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { User, Lock } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import FeedbackBanner, { FeedbackState } from '@/components/auth/FeedbackBanner';
import AuthInput from '@/components/auth/AuthInput';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';

const Login: React.FC = () => {
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLoginSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    email: loginIdentifier,
                    password: loginPassword,
                }),
            });

            const data = await response.json();
            const isResponseError = !response.ok;

            if (isResponseError) {
                throw new Error(data.message || 'As credenciais fornecidas estão incorretas.');
            }

            router.visit('/dashboard');
        } catch (error: any) {
            setFeedback({
                type: 'error',
                message: error.message || 'Falha ao autenticar. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout currentPage="login">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-700/80 transition-colors">
                <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <AuthInput
                        id="login-identifier"
                        label="E-mail ou @Nickname"
                        icon={User}
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="seu.email@exemplo.com ou @seu_usuario"
                        required
                    />

                    <AuthInput
                        id="login-password"
                        label="Senha"
                        icon={Lock}
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <div className="flex justify-end pt-0.5">
                        <Link
                            href="/forgot-password"
                            className="text-xs font-bold text-app-teal hover:underline transition-all"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <AuthSubmitButton isSubmitting={isSubmitting}>
                        Entrar na plataforma
                    </AuthSubmitButton>
                </form>

                <div className="mt-5 text-center border-t border-slate-200/80 dark:border-slate-700/80 pt-5 transition-colors">
                    <p className="text-xs font-medium text-app-graytext dark:text-gray-400 mb-2.5">
                        Ainda não tem conta no PONTUA?
                    </p>
                    <Link
                        href="/register"
                        className="w-full bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-app-navy dark:text-white font-bold py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-xs sm:text-sm uppercase tracking-wider text-center block"
                    >
                        Criar conta gratuitamente
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Login;
