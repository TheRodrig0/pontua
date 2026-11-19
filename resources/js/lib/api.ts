const DEFAULT_API_ERROR_MESSAGE = 'Ocorreu um erro ao processar a solicitação.'
const MUTATING_HTTP_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export interface ApiError extends Error {
    status?: number
    errors?: Record<string, string[]>
}

function getCookieValue(cookieName: string): string | null {
    if (typeof document === 'undefined') {
        const noCookieValue = null
        return noCookieValue
    }

    const cookiePrefix = `${cookieName}=`
    const matchingCookie = document.cookie
        .split('; ')
        .find((cookieEntry) => cookieEntry.startsWith(cookiePrefix))

    const cookieValue = matchingCookie
        ? decodeURIComponent(matchingCookie.slice(cookiePrefix.length))
        : null

    return cookieValue
}

function isSameOriginUrl(requestUrl: string): boolean {
    if (typeof window === 'undefined') {
        const isRelativeSameOrigin = requestUrl.startsWith('/') && !requestUrl.startsWith('//')
        return isRelativeSameOrigin
    }

    try {
        const parsedRequestUrl = new URL(requestUrl, window.location.origin)
        const isSameOrigin = parsedRequestUrl.origin === window.location.origin
        return isSameOrigin
    } catch {
        const isInvalidUrl = false
        return isInvalidUrl
    }
}

export function getCsrfToken(): string | null {
    const csrfCookieToken = getCookieValue('XSRF-TOKEN')
    return csrfCookieToken
}

export async function ensureCsrfCookie(): Promise<string | null> {
    const existingCsrfToken = getCsrfToken()
    if (existingCsrfToken) {
        return existingCsrfToken
    }

    await fetch('/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    })

    const refreshedCsrfToken = getCsrfToken()
    return refreshedCsrfToken
}

export async function apiRequest<TResponse>(
    requestUrl: string,
    requestOptions: RequestInit = {}
): Promise<TResponse> {
    const isSameOriginRequest = isSameOriginUrl(requestUrl)
    const requestMethod = (requestOptions.method || 'GET').toUpperCase()
    const isMutatingRequest = MUTATING_HTTP_METHODS.has(requestMethod)

    let csrfCookieToken = isSameOriginRequest ? getCsrfToken() : null
    if (isSameOriginRequest && isMutatingRequest && !csrfCookieToken) {
        csrfCookieToken = await ensureCsrfCookie()
    }

    const requestHeaders: Record<string, string> = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(requestOptions.headers as Record<string, string> | undefined),
    }

    const isFormDataBody = requestOptions.body instanceof FormData
    if (!isFormDataBody && !requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json'
    }

    if (csrfCookieToken) {
        requestHeaders['X-XSRF-TOKEN'] = csrfCookieToken
    }

    const response = await fetch(requestUrl, {
        credentials: 'same-origin',
        ...requestOptions,
        headers: requestHeaders,
    })

    const responseContentType = response.headers.get('content-type') || ''
    const isJsonResponse = responseContentType.includes('application/json')
    const responsePayload = isJsonResponse ? await response.json() : null

    if (!response.ok) {
        if (response.status === 401) {
            const isAuthRoute =
                typeof window !== 'undefined' &&
                (window.location.pathname.startsWith('/login') ||
                    window.location.pathname.startsWith('/register'))

            if (typeof window !== 'undefined' && !isAuthRoute) {
                window.location.href = '/login'
            }
        }

        const firstValidationError = responsePayload?.errors
            ? (Object.values(responsePayload.errors)[0] as string[])?.[0]
            : null

        const errorMessage =
            firstValidationError || responsePayload?.message || DEFAULT_API_ERROR_MESSAGE

        const apiError: ApiError = new Error(errorMessage)
        apiError.status = response.status
        apiError.errors = responsePayload?.errors
        throw apiError
    }

    const typedResponsePayload = responsePayload as TResponse
    return typedResponsePayload
}
