import { useState, useEffect, useCallback } from 'react';

const PWA_DISMISSED_KEY = 'pwa_install_dismissed';

const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

const isSafari = () => {
    const ua = navigator.userAgent;
    return /Safari/.test(ua) && !/Chrome|CriOS|Chromium|Edg|OPR/.test(ua);
};

export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(isStandalone());
    const [isDismissed, setIsDismissed] = useState(
        () => localStorage.getItem(PWA_DISMISSED_KEY) === 'true'
    );

    useEffect(() => {
        console.log('[PWA] Init:', {
            isStandalone: isStandalone(),
            isSafari: isSafari(),
            userAgent: navigator.userAgent,
            protocol: window.location.protocol,
            serviceWorker: 'serviceWorker' in navigator,
        });

        if (isInstalled) {
            console.log('[PWA] Already installed (standalone mode), skipping event listeners');
            return;
        }

        const handler = (e) => {
            e.preventDefault();
            console.log('[PWA] beforeinstallprompt fired!', e);
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        const installedHandler = () => {
            console.log('[PWA] appinstalled event fired!');
            setIsInstalled(true);
        };
        window.addEventListener('appinstalled', installedHandler);

        // Check service worker status
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((regs) => {
                console.log('[PWA] Service workers registered:', regs.length, regs.map(r => r.scope));
            });
        }

        // Check manifest
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
            fetch(manifestLink.href)
                .then(r => r.json())
                .then(m => console.log('[PWA] Manifest loaded:', m))
                .catch(e => console.error('[PWA] Manifest fetch failed:', e));
        } else {
            console.warn('[PWA] No <link rel="manifest"> found in document');
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, [isInstalled]);

    const needsManualGuide = isSafari() && !isInstalled;
    const canShowIcon = !isInstalled;
    const canPrompt = !isInstalled && !isDismissed && (!!deferredPrompt || needsManualGuide);

    const promptInstall = useCallback(async () => {
        console.log('[PWA] promptInstall called, deferredPrompt:', !!deferredPrompt);

        if (deferredPrompt) {
            try {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('[PWA] User choice:', outcome);
                if (outcome === 'accepted') {
                    setIsInstalled(true);
                }
                setDeferredPrompt(null);
                return outcome;
            } catch (err) {
                console.error('[PWA] prompt() error:', err);
            }
        } else {
            console.warn('[PWA] No deferred prompt available. beforeinstallprompt has not fired.');
            console.warn('[PWA] Checklist: 1) HTTPS? 2) Valid manifest with PNG icons? 3) Service worker registered? 4) Browser supports it?');
        }
        return null;
    }, [deferredPrompt]);

    const dismiss = useCallback(() => {
        setIsDismissed(true);
        localStorage.setItem(PWA_DISMISSED_KEY, 'true');
    }, []);

    return {
        canPrompt,
        canShowIcon,
        isInstalled,
        needsManualGuide,
        promptInstall,
        dismiss,
    };
}
