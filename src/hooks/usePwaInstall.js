import { useState, useEffect, useCallback } from 'react';

const PWA_DISMISSED_KEY = 'pwa_install_dismissed';

const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

const isSafari = () => {
    const ua = navigator.userAgent;
    return /Safari/.test(ua) && !/Chrome|CriOS|Chromium|Edg|OPR/.test(ua);
};

export function usePwaInstall() {
    // Pick up early-captured prompt from main.jsx, or null
    const [deferredPrompt, setDeferredPrompt] = useState(() => window.__pwaInstallPrompt || null);
    const [isInstalled, setIsInstalled] = useState(isStandalone());
    const [isDismissed, setIsDismissed] = useState(
        () => localStorage.getItem(PWA_DISMISSED_KEY) === 'true'
    );

    useEffect(() => {
        console.log('[PWA] Init:', {
            isStandalone: isStandalone(),
            isSafari: isSafari(),
            hasDeferredPrompt: !!deferredPrompt,
            protocol: window.location.protocol,
        });

        if (isInstalled) return;

        const handler = (e) => {
            e.preventDefault();
            console.log('[PWA] beforeinstallprompt fired!');
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        const installedHandler = () => {
            console.log('[PWA] appinstalled event fired!');
            setIsInstalled(true);
        };
        window.addEventListener('appinstalled', installedHandler);

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
                window.__pwaInstallPrompt = null;
                return outcome;
            } catch (err) {
                console.error('[PWA] prompt() error:', err);
            }
        } else {
            console.warn('[PWA] No deferred prompt available.');
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
        hasPrompt: !!deferredPrompt,
        needsManualGuide,
        promptInstall,
        dismiss,
    };
}
