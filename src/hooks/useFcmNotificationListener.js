import { useEffect } from 'react';
import { messaging, onMessage } from '../lib/firebase';

/**
 * App-level hook that listens for foreground FCM messages
 * and shows a native OS notification (not an in-browser toast).
 *
 * Mount this once at the top level (App.jsx) so it stays active
 * regardless of which page the user is on.
 */
export function useFcmNotificationListener() {
    useEffect(() => {
        if (!messaging) return;
        if (!('Notification' in window)) return;

        const unsubscribe = onMessage(messaging, (payload) => {
            const title = payload.data?.title || 'Reminder';
            const body = payload.data?.body || '';
            const tag = `${payload.data?.module || 'default'}-${payload.data?.type || 'reminder'}`;

            if (Notification.permission !== 'granted') return;

            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                    body,
                    icon: '/vite.svg',
                    badge: '/vite.svg',
                    tag,
                    data: payload.data || {},
                });
            });
        });

        return () => unsubscribe();
    }, []);
}
