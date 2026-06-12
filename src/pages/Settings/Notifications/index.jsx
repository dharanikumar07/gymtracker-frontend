import React, { useState, useEffect } from 'react';
import { 
    Bell, 
    Dumbbell, 
    Wallet, 
    Clock, 
    ChevronDown, 
    Plus, 
    Trash2, 
    Save, 
    Loader2,
    Check
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import api from '../../../lib/api';
import { toast } from 'sonner';
import TimePicker from '../../../components/TimePicker';

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


const Notifications = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        workout: { is_enabled: false, reminder_count: 2, times: ['10:00', '21:00'] },
        expense: { is_enabled: false, reminder_count: 2, times: ['10:00', '14:00'] }
    });

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
        <div className="w-full px-4 sm:px-[10%] pb-10">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <Bell className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-black uppercase tracking-tight text-foreground leading-none mb-1">
                                Notification Center
                            </h2>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
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
        </div>
    );
};

export default Notifications;
