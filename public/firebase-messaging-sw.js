/* eslint-disable no-undef */
// Firebase Messaging Service Worker
// Handles background push notifications when the app is not in focus

importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// Firebase config — these are public keys, safe to include in client code
firebase.initializeApp({
    apiKey: 'AIzaSyCBTDT-_iOnT4SXwZPwg7sxFap3uGGm2KE',
    authDomain: 'tracker-app-staging.firebaseapp.com',
    projectId: 'tracker-app-staging',
    messagingSenderId: '246501319743',
    appId: '1:246501319743:web:f4aecd07d4c0351ac2c48a',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'Reminder';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/vite.svg',
        badge: '/vite.svg',
        data: payload.data || {},
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
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
