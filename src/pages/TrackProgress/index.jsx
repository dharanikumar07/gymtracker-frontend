import React, { useState } from 'react';
import { Dumbbell, UtensilsCrossed, Activity, ClipboardList, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

import Routine from './Routine';
import TrackWorkout from './components/TrackWorkout';
import TrackDiet from './components/TrackDiet';
import ManageDiet from './components/ManageDiet';

const tabs = [
    { id: 'routine', label: 'Routine', icon: Activity },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'diet', label: 'Diet', icon: UtensilsCrossed },
    { id: 'manage_diet', label: 'Manage Diet', icon: ClipboardList },
];

const TrackProgress = () => {
    const [activeTab, setActiveTab] = useState('routine');

    return (
        <div className="h-full flex flex-col p-3 sm:p-5 lg:p-6 font-sans max-w-[1600px] mx-auto w-full">
            {/* Redesigned Navigation Bar - Static for Desktop, Dynamic for Mobile */}
            <div className="shrink-0 mb-6 px-1 sm:px-0">
                <div className="flex items-center justify-start gap-2 p-1.5 bg-background/40 backdrop-blur-md border border-border/40 rounded-full shadow-xl relative overflow-hidden group">
                    <div className="flex items-center gap-1 w-full sm:w-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "relative flex items-center justify-center gap-2 h-9 sm:h-10 rounded-full transition-all duration-500 group/btn",
                                        // Mobile: active expands (flex-[2]), others flex-1. Desktop: Static with padding (sm:px-5)
                                        isActive 
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 z-10 flex-[2] sm:flex-none sm:px-5" 
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 flex-1 sm:flex-none sm:px-5"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-in fade-in zoom-in-95 duration-300" />
                                    )}

                                    <div className="relative flex items-center gap-2">
                                        <Icon className={cn(
                                            "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300",
                                            isActive ? "scale-110" : "group-hover/btn:scale-110"
                                        )} />
                                        
                                        {/* 
                                            Text Logic:
                                            - Mobile: Only active shows text
                                            - Desktop: Always show text labels starting from left
                                        */}
                                        <span className={cn(
                                            "text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all duration-300 truncate",
                                            isActive ? "block" : "hidden sm:block"
                                        )}>
                                            {tab.label}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide no-scrollbar">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                    {activeTab === 'routine' && <Routine />}
                    {activeTab === 'workout' && <TrackWorkout />}
                    {activeTab === 'diet' && <TrackDiet />}
                    {activeTab === 'manage_diet' && <ManageDiet />}
                </div>
            </div>
        </div>
    );
};

export default TrackProgress;
