import { getAuthToken } from '@/lib/api';
import type { TaxReceiptItem } from '@/types/dashboard';

export interface TaxReceiptProcessedPayload {
    taxReceipt: TaxReceiptItem;
}

/**
 * Connects to Laravel Reverb (Pusher Protocol v7) on PrivateChannel("users.{userId}")
 * and listens for `TaxReceiptProcessedEvent` broadcast from `app/Events/TaxReceiptProcessedEvent.php`.
 *
 * When running in a single-port cloud preview where Reverb WebSocket is not exposed,
 * it degrades silently so `useDashboardData` polling handles real-time updates without console errors.
 */
export function subscribeToUserReceiptChannel(
    userId: number,
    onReceiptProcessed: (receipt: TaxReceiptItem) => void
): () => void {
    if (typeof window === 'undefined' || !userId) {
        return () => {};
    }

    const appKey = (import.meta as any).env?.VITE_REVERB_APP_KEY;
    if (!appKey) {
        return () => {};
    }

    const scheme = (import.meta as any).env?.VITE_REVERB_SCHEME || (window.location.protocol === 'https:' ? 'https' : 'http');
    const wsProtocol = scheme === 'https' ? 'wss' : 'ws';
    const host = (import.meta as any).env?.VITE_REVERB_HOST || window.location.hostname;
    const port = (import.meta as any).env?.VITE_REVERB_PORT || (scheme === 'https' ? 443 : 8080);

    const wsUrl = `${wsProtocol}://${host}:${port}/app/${appKey}?protocol=7&client=js&version=8.4.0&flash=false`;
    const channelName = `private-users.${userId}`;

    let ws: WebSocket | null = null;
    let isDisposed = false;

    try {
        ws = new WebSocket(wsUrl);

        ws.onmessage = async (messageEvent) => {
            if (isDisposed) {
                return;
            }

            try {
                const packet = JSON.parse(messageEvent.data);
                const eventName: string = packet?.event || '';
                const rawData = packet?.data;
                const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

                // 1. Handshake completed -> Authorize PrivateChannel("users.{userId}")
                if (eventName === 'pusher:connection_established' && parsedData?.socket_id) {
                    const token = getAuthToken();
                    const headers: Record<string, string> = {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    };
                    if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                    }

                    const authRes = await fetch('/broadcasting/auth', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            socket_id: parsedData.socket_id,
                            channel_name: channelName,
                        }),
                    });

                    if (authRes.ok && ws && ws.readyState === WebSocket.OPEN) {
                        const authPayload = await authRes.json();
                        ws.send(
                            JSON.stringify({
                                event: 'pusher:subscribe',
                                data: {
                                    auth: authPayload.auth,
                                    channel: channelName,
                                },
                            })
                        );
                    }
                    return;
                }

                // 2. Keep-alive ping/pong
                if (eventName === 'pusher:ping' && ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
                    return;
                }

                // 3. Handle TaxReceiptProcessedEvent broadcast
                const isReceiptProcessedEvent =
                    eventName === 'TaxReceiptProcessedEvent' ||
                    eventName === '.TaxReceiptProcessedEvent' ||
                    eventName === 'App\\Events\\TaxReceiptProcessedEvent';

                if (isReceiptProcessedEvent && parsedData?.taxReceipt) {
                    onReceiptProcessed(parsedData.taxReceipt as TaxReceiptItem);
                }
            } catch {
                // Ignore malformed frame
            }
        };

        ws.onerror = () => {
            // Silently close on connection error (fallback polling is active)
            try {
                ws?.close();
            } catch {
                // Ignore
            }
        };
    } catch {
        // Ignore WebSocket initialization failure
    }

    return () => {
        isDisposed = true;
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
            try {
                ws.close();
            } catch {
                // Ignore
            }
        }
    };
}
