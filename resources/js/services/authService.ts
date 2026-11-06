import { setAuthToken } from '@/lib/api';
import { translateLaravelValidationError } from '@/utils/validationMessages';
import type { UserProfile } from '@/types/dashboard';

export interface AuthResponse {
    user?: UserProfile;
    token?: string;
    message?: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface ResetPasswordPayload {
    token: string;
    password: string;
    password_confirmation: string;
}

export const authService = {
    async login(identifier: string, password: string): Promise<AuthResponse> {
        // Clear any previous token before authenticating
        setAuthToken(null);

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                email: identifier.trim(),
                password,
            }),
        });

        const contentType = response.headers.get('content-type') || '';
        const isJsonResponse = contentType.includes('application/json');
        const data = isJsonResponse ? await response.json() : null;

        if (!response.ok) {
            const rawMessage = data?.errors?.email?.[0] || data?.message;
            const message = translateLaravelValidationError(rawMessage, 'email');
            throw new Error(message || 'As credenciais fornecidas estão incorretas.');
        }

        if (data?.token) {
            setAuthToken(data.token);
        }

        return data as AuthResponse;
    },

    async register(payload: RegisterPayload): Promise<AuthResponse> {
        setAuthToken(null);

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(payload),
        });

        const contentType = response.headers.get('content-type') || '';
        const isJsonResponse = contentType.includes('application/json');
        const data = isJsonResponse ? await response.json() : null;

        if (!response.ok) {
            const translatedFieldErrors: Record<string, string> = {};
            const hasFieldErrors = Boolean(data?.errors);

            if (hasFieldErrors) {
                if (data.errors.name?.[0]) {
                    translatedFieldErrors.regName = translateLaravelValidationError(data.errors.name[0], 'name');
                }
                if (data.errors.email?.[0]) {
                    translatedFieldErrors.regEmail = translateLaravelValidationError(data.errors.email[0], 'email');
                }
                if (data.errors.password?.[0]) {
                    translatedFieldErrors.regPassword = translateLaravelValidationError(data.errors.password[0], 'password');
                }
            }

            const firstTranslatedError =
                Object.values(translatedFieldErrors)[0] ||
                translateLaravelValidationError(data?.message, 'default') ||
                'Falha ao realizar cadastro.';

            const err: any = new Error(firstTranslatedError);
            err.fieldErrors = translatedFieldErrors;
            throw err;
        }

        if (data?.token) {
            setAuthToken(data.token);
        }

        return data as AuthResponse;
    },

    async forgotPassword(email: string): Promise<{ message?: string }> {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ email: email.trim() }),
        });

        const contentType = response.headers.get('content-type') || '';
        const isJsonResponse = contentType.includes('application/json');
        const data = isJsonResponse ? await response.json() : null;

        if (!response.ok) {
            const rawMessage = data?.errors?.email?.[0] || data?.message;
            const message = translateLaravelValidationError(rawMessage, 'email');
            throw new Error(message || 'E-mail não encontrado no sistema.');
        }

        return data || { message: 'Link enviado com sucesso.' };
    },

    async resetPassword(payload: ResetPasswordPayload): Promise<{ message?: string }> {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                token: payload.token.trim(),
                password: payload.password,
                password_confirmation: payload.password_confirmation,
            }),
        });

        const contentType = response.headers.get('content-type') || '';
        const isJsonResponse = contentType.includes('application/json');
        const data = isJsonResponse ? await response.json() : null;

        if (!response.ok) {
            const rawMessage =
                data?.errors?.password?.[0] ||
                data?.errors?.token?.[0] ||
                data?.message;
            const field = data?.errors?.password ? 'password' : 'default';
            const message = translateLaravelValidationError(rawMessage, field);
            throw new Error(message || 'Não foi possível redefinir a senha.');
        }

        return data || { message: 'Sua senha foi redefinida com sucesso!' };
    },
};
