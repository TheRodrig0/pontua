import { apiRequest } from '@/lib/api';
import type { CursorPaginatedResponse, TaxReceiptItem } from '@/types/dashboard';

export function normalizeSefazQrPayload(rawContent: string): string {
    let trimmed = rawContent.trim();

    // 0. Decode USB scanner in US keyboard layout over Windows ABNT2
    if (trimmed.includes('>&&') || trimmed.includes('&qrcode')) {
        trimmed = trimmed
            .replace(/>&&/g, '://')
            .replace(/&qrcode_p\)/g, '/qrcode?p=')
            .replace(/&qrcode\?p=/g, '/qrcode?p=')
            .replace(/&qrcode/g, '/qrcode')
            .replace(/"/g, '|');
    }

    // 1. Official SEFAZ-SP URL (any subdomain of fazenda.sp.gov.br):
    // Normalize host to https://www.nfce.fazenda.sp.gov.br and encode pipes (%) for PHP FILTER_VALIDATE_URL
    const sefazHostMatch = trimmed.match(/^https?:\/\/(?:[a-z0-9-]+\.)*fazenda\.sp\.gov\.br(\/.*)?$/i);
    if (sefazHostMatch) {
        const pathAndQuery = (sefazHostMatch[1] || '/qrcode')
            .replace(/\s+/g, '')
            .replace(/\|/g, '%7C');
        const fullUrl = `https://www.nfce.fazenda.sp.gov.br${pathAndQuery}`;

        // Upgrade any ?p=chave|... query to SEFAZ-SP QR Code v3 (%7C3%7C1)
        const keyInParamMatch = fullUrl.match(/\?p=(35\d{42})(?:%7C.*)?$/i);
        if (keyInParamMatch) {
            return `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${keyInParamMatch[1]}%7C3%7C1`;
        }

        return fullUrl;
    }

    // 2. CF-e SAT QR Code ("352611...|timestamp|valor|...") or string containing a 44-digit SP access key
    const directMatch = trimmed.match(/(35\d{42})/);
    if (directMatch) {
        return `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${directMatch[1]}%7C3%7C1`;
    }

    // 3. Spaced 44-digit access key ("3526 1100 ...")
    const digitsOnly = trimmed.replace(/\D/g, '');
    const digitsMatch = digitsOnly.match(/^(35\d{42})/);
    if (digitsMatch) {
        return `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${digitsMatch[1]}%7C3%7C1`;
    }

    return trimmed.replace(/\|/g, '%7C');
}

export const taxReceiptService = {
    async index(cursor?: string | null): Promise<CursorPaginatedResponse<TaxReceiptItem>> {
        const hasCursor = Boolean(cursor);
        const endpoint = hasCursor
            ? `/api/tax-receipts?cursor=${encodeURIComponent(cursor!)}`
            : '/api/tax-receipts';

        return apiRequest<CursorPaginatedResponse<TaxReceiptItem>>(endpoint);
    },

    async store(rawUrlOrQrPayload: string): Promise<TaxReceiptItem> {
        const normalizedUrl = normalizeSefazQrPayload(rawUrlOrQrPayload);

        return apiRequest<TaxReceiptItem>('/api/tax-receipts', {
            method: 'POST',
            body: JSON.stringify({ url: normalizedUrl }),
        });
    },
};
