import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Trophy,
    History,
    HeartPulse,
    Loader2,
    RefreshCcw,
    Activity
} from 'lucide-react';
import api from '../../../lib/api';
import { cn } from '../../../lib/utils';

// Sub-tabs
import DailyRoutine from './DailyRoutine/index.jsx';
import TrackRoutine from './TrackRoutine/index.jsx';

const Progress = () => {
    const [activeSubTab, setActiveTab] = useState('track'); // Default to track
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/routine');
            setProgressData(response.data);
        } catch (err) {
            console.error("Failed to fetch progress data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const subTabs = [
        { id: 'track', label: 'Track Routine', icon: Activity },
        { id: 'daily', label: 'Manage Routine', icon: Calendar },
        { id: 'vault', label: 'PR Vault', icon: Trophy },
        { id: 'history', label: 'History', icon: History },
    ];

    if (loading && !progressData) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse italic">Accessing Routine...</p>
            </div>
        );
    }

    if (!progressData && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
                <RefreshCcw className="w-10 h-10 text-muted-foreground/20" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No active routine found</p>
                <button 
                    onClick={fetchData}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                    Retry Sync
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-background/50 overflow-hidden font-sans">
            {/* Top Navigation - Always Fixed */}
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

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 h-full">
                    <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {activeSubTab === 'track' && (
                            <TrackRoutine />
                        )}
                        {activeSubTab === 'daily' && (
                            <DailyRoutine 
                                data={progressData} 
                                onUpdate={fetchData} 
                            />
                        )}
                        {activeSubTab === 'vault' && (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground italic uppercase text-[10px] font-black tracking-widest bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border">
                                Personal Records Vault coming soon
                            </div>
                        )}
                        {activeSubTab === 'history' && (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground italic uppercase text-[10px] font-black tracking-widest bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border">
                                Training History coming soon
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Progress;
