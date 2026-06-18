import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { usePwaInstall } from './usePwaInstall';

const TOAST_SHOWN_KEY = 'pwa_toast_shown';

export function usePwaInstallToast() {
    const { canPrompt, needsManualGuide, promptInstall } = usePwaInstall();
    const shown = useRef(false);

    useEffect(() => {
        if (shown.current) return;
        if (!canPrompt) return;
        if (sessionStorage.getItem(TOAST_SHOWN_KEY)) return;

        shown.current = true;
        sessionStorage.setItem(TOAST_SHOWN_KEY, 'true');

        const timer = setTimeout(() => {
            if (needsManualGuide) {
                toast('Install Gym Tracker', {
                    description: 'Tap the Share button, then "Add to Home Screen"',
                    duration: 6000,
                });
            } else {
                toast('Install Gym Tracker', {
                    description: 'Add to your home screen for quick access',
                    duration: 6000,
                    action: {
                        label: 'Install',
                        onClick: () => promptInstall(),
                    },
                });
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [canPrompt, needsManualGuide, promptInstall]);
}
