import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { User, Mail, Lock } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import FeedbackBanner, { FeedbackState } from '@/components/auth/FeedbackBanner';
import AuthInput from '@/components/auth/AuthInput';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';

const Register: React.FC = () => {
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');

    const handleRegisterSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        const isNameEmpty = !regName.trim();
        const isNameTooShort = regName.trim().length < 3;
        if (isNameEmpty) {
            errors.regName = 'Informe seu nome completo';
        } else if (isNameTooShort) {
            errors.regName = 'O nome deve ter no mínimo 3 caracteres';
        }

        const isEmailEmpty = !regEmail.trim();
        const isEmailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim());
        if (isEmailEmpty) {
            errors.regEmail = 'Informe seu e-mail FATEC ou pessoal';
        } else if (isEmailInvalid) {
            errors.regEmail = 'Formato de e-mail inválido';
        }

        const isPasswordEmpty = !regPassword;
        const isPasswordTooShort = regPassword.length < 6;
        if (isPasswordEmpty) {
            errors.regPassword = 'Crie uma senha de acesso';
        } else if (isPasswordTooShort) {
            errors.regPassword = 'A senha precisa ter no mínimo 6 caracteres';
        }

        const isConfirmEmpty = !regConfirmPassword;
        const isPasswordMismatch = regPassword !== regConfirmPassword;
        if (isConfirmEmpty) {
            errors.regConfirmPassword = 'Confirme sua senha';
        } else if (isPasswordMismatch) {
            errors.regConfirmPassword = 'As senhas não coincidem';
        }

        const hasValidationErrors = Object.keys(errors).length > 0;
        if (hasValidationErrors) {
            setFieldErrors(errors);
            setFeedback({
                type: 'error',
                message: 'Por favor, revise os campos destacados antes de continuar.',
            });
            return;
        }

        setFieldErrors({});
        setIsSubmitting(true);
        setFeedback(null);

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    name: regName,
                    email: regEmail,
                    password: regPassword,
                    password_confirmation: regConfirmPassword,
                }),
            });

            const data = await response.json();
            const isResponseError = !response.ok;

            if (isResponseError) {
                if (data.errors) {
                    const serverErrors: Record<string, string> = {};
                    if (data.errors.name) {
                        serverErrors.regName = data.errors.name[0];
                    }
                    if (data.errors.email) {
                        serverErrors.regEmail = data.errors.email[0];
                    }
                    if (data.errors.password) {
                        serverErrors.regPassword = data.errors.password[0];
                    }
                    setFieldErrors(serverErrors);
                }
                throw new Error(data.message || 'Falha ao realizar cadastro.');
            }

            router.visit('/dashboard');
        } catch (error: any) {
            setFeedback({
                type: 'error',
                message: error.message || 'Erro inesperado ao cadastrar.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout currentPage="register">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-700/80 transition-colors">
                <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 sm:space-y-4">
                    <AuthInput
                        id="reg-name"
                        label="Nome Completo"
                        icon={User}
                        type="text"
                        value={regName}
                        onChange={(e) => {
                            setRegName(e.target.value);
                            const hasNameError = Boolean(fieldErrors.regName);
                            if (hasNameError) {
                                setFieldErrors((prev) => ({ ...prev, regName: '' }));
                            }
                        }}
                        error={fieldErrors.regName}
                        placeholder="Ex: Maria Clara da Silva"
                        required
                    />

                    <AuthInput
                        id="reg-email"
                        label="E-mail FATEC ou Pessoal"
                        icon={Mail}
                        type="email"
                        value={regEmail}
                        onChange={(e) => {
                            setRegEmail(e.target.value);
                            const hasEmailError = Boolean(fieldErrors.regEmail);
                            if (hasEmailError) {
                                setFieldErrors((prev) => ({ ...prev, regEmail: '' }));
                            }
                        }}
                        error={fieldErrors.regEmail}
                        placeholder="seu.email@fatec.sp.gov.br"
                        required
                    />

                    <div>
                        <AuthInput
                            id="reg-password"
                            label="Senha de Acesso (Mínimo 6 caracteres)"
                            icon={Lock}
                            type="password"
                            value={regPassword}
                            onChange={(e) => {
                                setRegPassword(e.target.value);
                                const hasPasswordError = Boolean(fieldErrors.regPassword);
                                if (hasPasswordError) {
                                    setFieldErrors((prev) => ({ ...prev, regPassword: '' }));
                                }
                            }}
                            error={fieldErrors.regPassword}
                            placeholder="••••••••"
                            required
                        />
                        <PasswordStrengthMeter password={regPassword} />
                    </div>

                    <AuthInput
                        id="reg-confirm-password"
                        label="Confirmar Senha"
                        icon={Lock}
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => {
                            setRegConfirmPassword(e.target.value);
                            const hasConfirmError = Boolean(fieldErrors.regConfirmPassword);
                            if (hasConfirmError) {
                                setFieldErrors((prev) => ({ ...prev, regConfirmPassword: '' }));
                            }
                        }}
                        error={fieldErrors.regConfirmPassword}
                        placeholder="••••••••"
                        required
                    />

                    <p className="text-[11px] text-app-graytext dark:text-gray-400 leading-relaxed px-1">
                        Ao cadastrar-se, você concorda em doar cupons fiscais do estado de SP para conversão de benefícios pela APAE e pontuação na FATEC.
                    </p>

                    <AuthSubmitButton isSubmitting={isSubmitting} className="mt-1">
                        Criar minha conta
                    </AuthSubmitButton>
                </form>

                <div className="mt-5 text-center border-t border-slate-200/80 dark:border-slate-700/80 pt-5 transition-colors">
                    <p className="text-xs font-medium text-app-graytext dark:text-gray-400 mb-2.5">
                        Já tem uma conta cadastrada?
                    </p>
                    <Link
                        href="/login"
                        className="w-full bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-app-navy dark:text-white font-bold py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-xs sm:text-sm uppercase tracking-wider text-center block"
                    >
                        Já tenho uma conta • Entrar
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Register;
