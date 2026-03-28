import React from 'react';
import { Zap, TrendingUp, Target, Flame, Heart, Activity } from 'lucide-react';

const FEATURES = [
    { icon: Zap, title: 'Track Progress', desc: 'Monitor gains daily' },
    { icon: TrendingUp, title: 'Analytics', desc: 'Visualize growth' },
    { icon: Flame, title: 'Track Expenses', desc: 'Track your daily expenses' },
    { icon: Flame, title: 'Set Budget Plan', desc: 'Set you budget plan for n no of days' },
    { icon: Target, title: 'Goals', desc: 'Set & achieve' },
    { icon: Flame, title: 'Streaks', desc: 'Stay consistent' }
];

const LeftBanner = () => {
    return (
        <div 
            className="hidden lg:flex lg:w-[40%] relative overflow-hidden flex flex-col pt-2 px-10 xl:pt-4 xl:px-14 shrink-0"
            style={{ backgroundColor: 'var(--banner-bg, #fafafa)' }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
            </div>
            
            {/* Glow Effects */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-zinc-200/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 dark:bg-white/5" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-zinc-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 dark:bg-white/5" />
            
            {/* Header Section */}
                {/* Logo & Tagline */}
                <div className="flex items-center gap-4 mb-8 pt-2">
                    <div className="w-12 h-12 bg-primary border-2 border-primary/30 dark:border-primary/50 dark:bg-white/10 rounded-xl flex items-center justify-center shadow-2xl">
                        <Activity className="w-6 h-6 text-white dark:text-primary" />
                    </div>
                    <div>
                        <span className="text-2xl font-black uppercase tracking-tight italic" style={{ color: 'var(--logo-text, black)' }}>GymOS</span>
                        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--logo-subtext, #4b5563)' }}>Fitness Tracker</p>
                    </div>
                </div>
                
                {/* Hero Title */}
                <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tight leading-tight mb-4" style={{ color: 'var(--hero-text, black)' }}>
                    Build Your <span style={{ color: 'var(--hero-subtext, #374151)' }}>Legacy.</span>
                </h1>
                
                {/* Description */}
                <p className="text-sm leading-relaxed max-w-md font-medium mb-6" style={{ color: 'var(--hero-desc, #4b5563)' }}>
                    Track workouts, monitor nutrition, analyze progress, and achieve your fitness goals with precision.
                </p>
            
            {/* Features Grid - Takes remaining space */}
            <div className="relative z-10 flex-1 grid grid-cols-2 gap-3 content-start">
                {FEATURES.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                        <div 
                            key={i} 
                            className="rounded-2xl p-4 border-2 border-primary/30 dark:border-primary/50"
                            style={{ backgroundColor: 'var(--card-bg, white)' }}
                        >
                            <Icon className="w-5 h-5 text-primary mb-2" />
                            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--card-title, black)' }}>{feature.title}</p>
                            <p className="text-[9px] mt-0.5" style={{ color: 'var(--card-desc, #4b5563)' }}>{feature.desc}</p>
                        </div>
                    );
                })}
            </div>
            
            {/* Footer - Always at bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-3 px-10 xl:px-14 pb-4">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 border-2 border-primary/30 dark:border-primary/50 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--footer-text, #4b5563)' }}>
                    Made for fitness enthusiasts
                </p>
            </div>
        </div>
    );
};

export default LeftBanner;
