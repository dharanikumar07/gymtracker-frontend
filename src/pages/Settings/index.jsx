import React from 'react';
import { Settings, User, Bell, Lock, Palette, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const settingsItems = [
    { icon: User, label: 'Profile', description: 'Manage your account details' },
    { icon: Bell, label: 'Notifications', description: 'Configure push notifications' },
    { icon: Lock, label: 'Privacy & Security', description: 'Password and security settings' },
    { icon: Palette, label: 'Appearance', description: 'Theme and display preferences' },
    { icon: HelpCircle, label: 'Help & Support', description: 'FAQs and contact support' },
];

const SettingsPage = () => {
    return (
        <div className="h-full flex flex-col p-4 font-sans">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-[14px] font-black uppercase italic text-foreground">Settings</h1>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Customize your experience</p>
                </div>
            </div>

            <div className="space-y-3">
                {settingsItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button key={index} className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-[12px] font-black text-foreground uppercase italic">{item.label}</h3>
                                <p className="text-[9px] font-bold text-muted-foreground">{item.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SettingsPage;
