export function formatCurrencyBRL(value: string | number | undefined | null): string {
    const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value || 0);
    const isInvalidNumber = Number.isNaN(numericValue);

    if (isInvalidNumber) {
        return 'R$ 0,00';
    }

    return numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

export function formatDateShort(isoString: string | null | undefined): string {
    const hasValue = Boolean(isoString);
    if (!hasValue) {
        return '—';
    }

    try {
        const date = new Date(isoString!);
        const isInvalidDate = Number.isNaN(date.getTime());
        if (isInvalidDate) {
            return '—';
        }

        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
}

export function formatAccessKeyPreview(accessKey: string): string {
    const hasAccessKey = Boolean(accessKey);
    if (!hasAccessKey) {
        return '---- ---- ---- ---- ----...';
    }

    const digitsOnly = accessKey.replace(/\D/g, '').slice(0, 20);
    const groups = digitsOnly.match(/.{1,4}/g) || [accessKey.slice(0, 20)];
    return `${groups.join(' ')}...`;
}

export function normalizeSearchText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}
