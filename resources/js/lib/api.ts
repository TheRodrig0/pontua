export interface ApiError extends Error {
    status?: number;
    errors?: Record<string, string[]>;
}

function getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
}

export function getAuthToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getItem('pontua_auth_token');
}

export function setAuthToken(token: string | null): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (token) {
        localStorage.setItem('pontua_auth_token', token);
    } else {
        localStorage.removeItem('pontua_auth_token');
    }
}

export async function apiRequest<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();
    const xsrfToken = getCookieValue('XSRF-TOKEN');

    const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(options.headers as Record<string, string> | undefined),
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
        const firstValidationError = data?.errors
            ? (Object.values(data.errors)[0] as string[])?.[0]
            : null;

        const error: ApiError = new Error(
            firstValidationError || data?.message || 'Ocorreu um erro ao processar a solicitação.'
        );
        error.status = response.status;
        error.errors = data?.errors;
        throw error;
    }

    return data as T;
}
