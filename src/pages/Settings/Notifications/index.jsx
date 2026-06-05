import React from 'react';
import { Bell, ShieldCheck } from 'lucide-react';

const Notifications = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="bg-card border border-border rounded-[2.5rem] p-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                    <Bell className="w-10 h-10 text-primary opacity-40" />
                </div>
                <h3 className="text-[16px] font-black uppercase tracking-tight text-foreground mb-3">Notification Center</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium mb-8 max-w-[280px]">
                    Notification preferences and alerting system configuration will be available soon.
                </p>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-xl border border-border/50">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60">System Integrated</span>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
