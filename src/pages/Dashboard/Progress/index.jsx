import React, { useState } from 'react';
import {
    Calendar,
    Trophy,
    History,
    HeartPulse,
    Loader2,
    RefreshCcw,
    Activity,
    Utensils,
    ClipboardList
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useRoutineQuery } from './http/progressQueries';

// Sub-tabs
import DailyRoutine from './DailyRoutine/index.jsx';
import TrackRoutine from './TrackRoutine/index.jsx';
import ManageDiet from './ManageDiet/index.jsx';
import TrackDiet from './TrackDiet/index.jsx';

const Progress = () => {
    const [activeSubTab, setActiveTab] = useState('track_routine');
    const { data: progressData, isLoading: loading, refetch } = useRoutineQuery();

    const subTabs = [
        { id: 'track_routine', label: 'Track Workout', icon: Activity },
        { id: 'daily', label: 'Manage Routine', icon: Calendar },
        { id: 'track_diet', label: 'Track Diet', icon: Utensils },
        { id: 'manage_diet', label: 'Manage Diet', icon: ClipboardList },
    ];

    if (loading && !progressData) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse italic">Accessing Atlas...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-background/50 overflow-hidden font-sans">
            {/* Top Navigation */}
            <div className="w-full bg-background/80 backdrop-blur-md border-b border-border p-2 sm:p-4 shrink-0">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
                    <div className="bg-secondary/50 p-1.5 rounded-2xl flex flex-1 lg:flex-initial gap-1 overflow-x-auto no-scrollbar shadow-inner border border-border/50">
                        {subTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeSubTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex-1 lg:flex-initial",
                                        isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 h-full">
                    <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {activeSubTab === 'track_routine' && (
                            <TrackRoutine />
                        )}
                        {activeSubTab === 'daily' && (
                            <DailyRoutine 
                                data={progressData} 
                                onUpdate={refetch} 
                            />
                        )}
                        {activeSubTab === 'manage_diet' && (
                            <ManageDiet />
                        )}
                        {activeSubTab === 'track_diet' && (
                            <TrackDiet />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Progress;
