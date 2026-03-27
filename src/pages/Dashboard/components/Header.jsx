import React from 'react';
import { Bell, Dumbbell } from 'lucide-react';

const Header = ({ user }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-black uppercase italic text-foreground">
                        {user?.name || 'Welcome'}
                    </h1>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Let's crush it today
                    </p>
                </div>
            </div>
            <button className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors relative">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
        </div>
    );
};

export default Header;
