import React, { useState, useEffect } from 'react';
import {
    Bell,
    Dumbbell,
    Wallet,
    Save,
    Loader2,
    X,
    Lock,
    MousePointerClick,
    ToggleRight,
    RefreshCw,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import api from '../../../lib/api';
import { toast } from 'sonner';
import TimePicker from '../../../components/TimePicker';
import { useFirebaseMessaging } from '../../../hooks/useFirebaseMessaging';

const REMINDER_COUNT_OPTIONS = [
    { id: 2, label: '2x' },
    { id: 3, label: '3x' },
];

const DEFAULT_TIMES = ['10:00', '14:00', '21:00'];

const SectionHeader = ({ icon: Icon, title, isEnabled, onToggle }) => (
    <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-5">
        <div className="flex items-center gap-3">
            <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all",
                isEnabled ? "bg-primary shadow-primary/20" : "bg-secondary text-muted-foreground"
            )}>
                <Icon className={cn("w-5 h-5", isEnabled ? "text-white" : "")} />
            </div>
            <div>
                <h3 className="text-[14px] font-black uppercase tracking-tight text-foreground">{title}</h3>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    {isEnabled ? 'Reminders Active' : 'Notifications Disabled'}
                </p>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <button
                onClick={onToggle}
                className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none",
                    isEnabled ? "bg-primary" : "bg-secondary"
                )}
            >
                <span className={cn(
                    "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform duration-300",
                    isEnabled ? "translate-x-4.5" : "translate-x-0.5"
                )} />
            </button>
        </div>
    </div>
);

const NotificationSection = ({
    icon,
    title,
    data,
    onChange
}) => {
    const { is_enabled, reminder_count = 2, times = [] } = data;

    const handleCountChange = (count) => {
        let newTimes = [...times];
        if (count > newTimes.length) {
            const needed = count - newTimes.length;
            const extra = DEFAULT_TIMES.slice(newTimes.length, newTimes.length + needed);
            newTimes = [...newTimes, ...extra];
        } else {
            newTimes = newTimes.slice(0, count);
        }
        onChange({ ...data, reminder_count: count, times: newTimes });
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...times];
        newTimes[index] = value;
        onChange({ ...data, times: newTimes });
    };

    return (
        <div className="bg-card border border-border/60 rounded-[1.5rem] p-5 shadow-sm">
            <SectionHeader
                icon={icon}
                title={title}
                isEnabled={is_enabled}
                onToggle={() => onChange({ ...data, is_enabled: !is_enabled })}
            />

            <div className={cn(
                "space-y-6 transition-all duration-300",
                !is_enabled && "opacity-60"
            )}>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        How many times need to remind you
                    </label>
                    <div className="flex gap-2 p-1 bg-secondary/5 rounded-xl border border-border/40 w-fit">
                        {REMINDER_COUNT_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                disabled={!is_enabled}
                                onClick={() => handleCountChange(opt.id)}
                                className={cn(
                                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all",
                                    reminder_count === opt.id
                                        ? "bg-background text-primary shadow-sm border border-border/20"
                                        : "text-muted-foreground hover:text-foreground",
                                    !is_enabled && "cursor-not-allowed"
                                )}
                            >
                                {opt.id}x
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Reminder Schedule
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Array.from({ length: reminder_count }).map((_, idx) => (
                            <div key={idx} className="relative group">
                                <TimePicker
                                    value={times[idx] || '10:00'}
                                    disabled={!is_enabled}
                                    onChange={(value) => handleTimeChange(idx, value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Browser-specific instructions to unblock notifications.
 */
const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'chrome';
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
    if (ua.includes('Edg')) return 'edge';
    return 'chrome';
};

const BROWSER_STEPS = {
    chrome: [
        { icon: Lock, text: 'Click the lock/tune icon in the address bar (left of the URL)' },
        { icon: MousePointerClick, text: 'Find "Notifications" in the dropdown' },
        { icon: ToggleRight, text: 'Change it from "Block" to "Allow"' },
        { icon: RefreshCw, text: 'Reload this page and try again' },
    ],
    firefox: [
        { icon: Lock, text: 'Click the lock icon in the address bar' },
        { icon: MousePointerClick, text: 'Click "Connection secure" then "More Information"' },
        { icon: ToggleRight, text: 'Go to Permissions tab, find Notifications, and remove the block' },
        { icon: RefreshCw, text: 'Reload this page and try again' },
    ],
    safari: [
        { icon: Lock, text: 'Open Safari > Settings > Websites > Notifications' },
        { icon: MousePointerClick, text: 'Find this website in the list' },
        { icon: ToggleRight, text: 'Change from "Deny" to "Allow"' },
        { icon: RefreshCw, text: 'Reload this page and try again' },
    ],
    edge: [
        { icon: Lock, text: 'Click the lock icon in the address bar' },
        { icon: MousePointerClick, text: 'Find "Notifications" in the site permissions' },
        { icon: ToggleRight, text: 'Change it from "Block" to "Allow"' },
        { icon: RefreshCw, text: 'Reload this page and try again' },
    ],
};

const NotificationBlockedGuide = ({ onClose }) => {
    const browser = getBrowserName();
    const steps = BROWSER_STEPS[browser] || BROWSER_STEPS.chrome;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-black uppercase tracking-tight text-foreground">
                                Notifications Blocked
                            </h3>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Enable in browser settings
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary/50 transition-colors"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        You previously blocked notifications for this site.
                        The browser won't ask again automatically.
                        Follow these steps to unblock:
                    </p>

                    <div className="space-y-3">
                        {steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] font-black text-primary">{i + 1}</span>
                                </div>
                                <div className="flex items-center gap-2 min-h-[32px]">
                                    <step.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <p className="text-[11px] text-foreground leading-snug">{step.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 pt-0">
                    <button
                        onClick={onClose}
                        className="w-full h-10 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};


const Notifications = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        workout: { is_enabled: false, reminder_count: 2, times: ['10:00', '21:00'] },
        expense: { is_enabled: false, reminder_count: 2, times: ['10:00', '14:00'] }
    });

    const {
        requestPermissionAndRegister,
        isSupported,
        showBlockedGuide,
        setShowBlockedGuide,
    } = useFirebaseMessaging();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings/notifications');
            if (response.data?.data) {
                const data = response.data.data;
                setSettings({
                    workout: data.workout || settings.workout,
                    expense: data.expense || settings.expense
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const anyEnabled = settings.workout.is_enabled || settings.expense.is_enabled;

            // If any module is enabled, we must have notification permission
            if (anyEnabled && isSupported) {
                const result = await requestPermissionAndRegister();
                if (result !== 'granted') {
                    // Permission denied or blocked — don't save
                    setIsSaving(false);
                    return;
                }
            }

            await api.post('/settings/notifications', {
                type: 'notification',
                ...settings
            });
            toast.success('Notification settings updated');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Settings...</p>
            </div>
        );
    }

    return (
        <div className="w-full px-6 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <Bell className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-black tracking-tight text-foreground leading-none mb-1">
                                Notification Center
                            </h2>
                            <p className="text-[9px] font-bold text-muted-foreground tracking-widest opacity-70">
                                Manage your daily reminders
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-1.5 h-8 px-6 rounded-lg bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 active:scale-95 group"
                    >
                        {isSaving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Save className="w-3 h-3" />
                        )}
                        <span>{isSaving ? 'Saving' : 'Save'}</span>
                    </button>
                </div>

                <div className="space-y-5">
                    <NotificationSection
                        icon={Dumbbell}
                        title="Workout Reminders"
                        data={settings.workout}
                        onChange={(val) => setSettings({ ...settings, workout: val })}
                    />

                    <NotificationSection
                        icon={Wallet}
                        title="Expense Reminders"
                        data={settings.expense}
                        onChange={(val) => setSettings({ ...settings, expense: val })}
                    />
                </div>
            </div>

            {showBlockedGuide && (
                <NotificationBlockedGuide onClose={() => setShowBlockedGuide(false)} />
            )}
        </div>
    );
};

export default Notifications;
