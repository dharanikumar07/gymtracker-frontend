import { useState, useEffect, useCallback } from 'react';
import { messaging, getToken } from '../lib/firebase';
import { saveDeviceTokenApi, removeDeviceTokenApi } from '../pages/Settings/http/api';
import { toast } from 'sonner';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const FCM_TOKEN_KEY = 'fcm_device_token';

/**
 * Hook to manage Firebase Cloud Messaging.
 *
 * @returns {{
 *   requestPermissionAndRegister: () => Promise<'granted'|'denied'|'unsupported'>,
 *   unregisterToken: () => Promise<void>,
 *   isSupported: boolean,
 *   permissionStatus: 'default'|'granted'|'denied',
 *   showBlockedGuide: boolean,
 *   setShowBlockedGuide: (v: boolean) => void,
 * }}
 */
export function useFirebaseMessaging() {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && messaging !== null;

    const [permissionStatus, setPermissionStatus] = useState(
        isSupported ? Notification.permission : 'default'
    );
    const [showBlockedGuide, setShowBlockedGuide] = useState(false);

    // Keep permissionStatus in sync (e.g. user changes it in browser settings and comes back)
    useEffect(() => {
        if (!isSupported) return;
        setPermissionStatus(Notification.permission);
    }, [isSupported]);

    const registerServiceWorker = useCallback(async () => {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        // Wait until the service worker is active before using it
        if (!registration.active) {
            await new Promise((resolve) => {
                const sw = registration.installing || registration.waiting;
                if (!sw) {
                    resolve();
                    return;
                }
                sw.addEventListener('statechange', (e) => {
                    if (e.target.state === 'activated') resolve();
                });
            });
        }

        return registration;
    }, []);

    /**
     * Request notification permission, get FCM token, and save to backend.
     *
     * Returns:
     *   'granted'     — success
     *   'denied'      — browser blocked, cannot prompt again
     *   'unsupported' — browser doesn't support notifications
     */
    const requestPermissionAndRegister = useCallback(async () => {
        if (!isSupported) {
            toast.error('Push notifications are not supported in this browser.');
            return 'unsupported';
        }

        // Already blocked — show the guide modal
        if (Notification.permission === 'denied') {
            setShowBlockedGuide(true);
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);

            if (permission !== 'granted') {
                // User just clicked "Block" on the prompt
                setShowBlockedGuide(true);
                return 'denied';
            }

            const registration = await registerServiceWorker();

            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration,
            });

            if (!token) {
                toast.error('Failed to get notification token. Try again.');
                return 'denied';
            }

            await saveDeviceTokenApi({
                fcm_token: token,
                device_type: 'web',
            });

            localStorage.setItem(FCM_TOKEN_KEY, token);
            return 'granted';
        } catch (error) {
            console.error('FCM registration failed:', error?.message, error);
            const msg = error?.message || 'Unknown error';
            toast.error(`Failed to enable notifications: ${msg}`);
            return 'denied';
        }
    }, [isSupported, registerServiceWorker]);

    const unregisterToken = useCallback(async () => {
        const token = localStorage.getItem(FCM_TOKEN_KEY);
        if (!token) return;

        try {
            await removeDeviceTokenApi({ fcm_token: token });
        } catch (error) {
            console.error('Failed to deactivate device token:', error);
        } finally {
            localStorage.removeItem(FCM_TOKEN_KEY);
        }
    }, []);

    return {
        requestPermissionAndRegister,
        unregisterToken,
        isSupported,
        permissionStatus,
        showBlockedGuide,
        setShowBlockedGuide,
    };
}
