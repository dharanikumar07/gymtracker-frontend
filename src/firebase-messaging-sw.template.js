/* eslint-disable no-undef */
// Firebase Messaging Service Worker
// Handles background push notifications when the app is not in focus
// NOTE: This is a template — Vite injects env values at build time.

importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: '__VITE_FIREBASE_API_KEY__',
    authDomain: '__VITE_FIREBASE_AUTH_DOMAIN__',
    projectId: '__VITE_FIREBASE_PROJECT_ID__',
    messagingSenderId: '__VITE_FIREBASE_MESSAGING_SENDER_ID__',
    appId: '__VITE_FIREBASE_APP_ID__',
});

const messaging = firebase.messaging();

// v2 — data-only messages, manual notification display
// Handle background messages (data-only — no 'notification' key from server)
messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Background payload:', JSON.stringify(payload));
    const title = payload.data?.title || 'Reminder';
    const options = {
        body: payload.data?.body || '',
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: `${payload.data?.module || 'default'}-${payload.data?.type || 'reminder'}`,
        data: payload.data || {},
    };

    self.registration.showNotification(title, options);
});

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
