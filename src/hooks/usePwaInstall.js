import { useState, useEffect, useCallback } from 'react';

const PWA_DISMISSED_KEY = 'pwa_install_dismissed';

const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

// Safari (iOS + Mac) doesn't support beforeinstallprompt — needs manual guide
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
        if (isInstalled) return;

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        const installedHandler = () => setIsInstalled(true);
        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, [isInstalled]);

    const needsManualGuide = isSafari() && !isInstalled;
    // Icon always visible unless app is installed (standalone mode)
    const canShowIcon = !isInstalled;
    // Toast respects dismiss — only shown once
    const canPrompt = !isInstalled && !isDismissed && (!!deferredPrompt || needsManualGuide);

    const promptInstall = useCallback(async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsInstalled(true);
            }
            setDeferredPrompt(null);
            return outcome;
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
