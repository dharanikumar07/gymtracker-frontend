import React, { useState } from 'react';
import { Target, CreditCard, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

import ExpenseSetup from './Setup';
import ExpenseLog from './Log';
import { ExpenseProvider, useExpense } from './Setup/context/ExpenseContext';
import { ExpenseLogProvider, useExpenseLog } from './Log/ExpenseLogContext';

const tabs = [
    { id: 'setup', label: 'Setup', icon: Target },
    { id: 'log', label: 'Log', icon: CreditCard },
];

const UnsavedChangesModal = ({ isOpen, onCancel, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" />
            <div className="relative w-full max-w-[340px] bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-[14px] font-black uppercase tracking-tight text-foreground mb-2">Unsaved Changes</h3>
                    <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed px-4">
                        You have pending edits. Switching menus will discard these changes. Continue?
                    </p>
                </div>
                <div className="flex border-t border-border">
                    <button 
                        onClick={onCancel}
                        className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary/50 transition-colors border-r border-border"
                    >
                        Stay
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/5 transition-colors"
                    >
                        Discard
                    </button>
                </div>
            </div>
        </div>
    );
};

const TrackExpenseContent = ({ activeTab, setActiveTab }) => {
    const [pendingTab, setPendingTab] = useState(null);
    const { hasUnsavedChanges: hasLogChanges, clearUnsavedChanges: clearLogChanges } = useExpenseLog();
    const { hasUnsavedChanges: hasSetupChanges, clearUnsavedChanges: clearSetupChanges } = useExpense();

    const hasAnyUnsavedChanges = hasLogChanges || hasSetupChanges;

    const handleTabClick = (tabId) => {
        if (activeTab === tabId) return;
        
        // Only show modal if navigating AWAY FROM the log tab and there are LOG-SPECIFIC unsaved changes
        // (Ignoring setup changes while on the log tab)
        if (activeTab === 'log' && hasLogChanges) {
            setPendingTab(tabId);
        } else {
            setActiveTab(tabId);
        }
    };

    const confirmNavigation = () => {
        clearLogChanges();
        clearSetupChanges();
        setActiveTab(pendingTab);
        setPendingTab(null);
    };

    return (
        <div className="h-full flex flex-col p-3 sm:p-5 lg:p-6 font-sans max-w-[1600px] mx-auto w-full">
            <UnsavedChangesModal 
                isOpen={!!pendingTab}
                onCancel={() => setPendingTab(null)}
                onConfirm={confirmNavigation}
            />

            {/* Navigation Bar */}
            <div className="shrink-0 mb-6 px-1 sm:px-0">
                <div className="flex items-center justify-start gap-2 p-1.5 bg-background/40 backdrop-blur-md border border-border/40 rounded-full shadow-xl relative overflow-hidden group">
                    <div className="flex items-center gap-1 w-full sm:w-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={cn(
                                        "relative flex items-center justify-center gap-2 h-9 sm:h-10 rounded-full transition-all duration-500 group/btn",
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
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {activeTab === 'setup' && <ExpenseSetup />}
                    {activeTab === 'log' && <ExpenseLog />}
                </div>
            </div>
        </div>
    );
};

const TrackExpense = () => {
    const [activeTab, setActiveTab] = useState('setup');

    return (
        <ExpenseProvider isActive={activeTab === 'setup'}>
            <ExpenseLogProvider isActive={activeTab === 'log'}>
                <TrackExpenseContent activeTab={activeTab} setActiveTab={setActiveTab} />
            </ExpenseLogProvider>
        </ExpenseProvider>
    );
};

export default TrackExpense;
