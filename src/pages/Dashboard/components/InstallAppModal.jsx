import React from 'react';
import { Home, Share, Plus, EllipsisVertical } from 'lucide-react';

const InstallAppModal = ({ onCancel, onConfirm, hasPrompt, needsManualGuide }) => {
    // 3 states: native prompt available, Safari manual guide, Chrome/other menu guide
    const showChromeGuide = !hasPrompt && !needsManualGuide;

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCancel} />
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Home className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-black uppercase tracking-tight text-foreground">
                                Install App
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                Quick access from your home screen
                            </p>
                        </div>
                    </div>

                    {needsManualGuide && (
                        <div className="bg-secondary/50 rounded-xl p-3.5 space-y-2">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Share className="w-3 h-3 text-blue-500" />
                                </div>
                                <p className="text-[10px] font-bold text-foreground">
                                    Tap the <span className="text-blue-500">Share</span> button in Safari
                                </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Plus className="w-3 h-3 text-emerald-500" />
                                </div>
                                <p className="text-[10px] font-bold text-foreground">
                                    Select <span className="text-emerald-500">Add to Home Screen</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {showChromeGuide && (
                        <div className="bg-secondary/50 rounded-xl p-3.5 space-y-2">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <EllipsisVertical className="w-3 h-3 text-blue-500" />
                                </div>
                                <p className="text-[10px] font-bold text-foreground">
                                    Click the <span className="text-blue-500">menu (⋮)</span> in your browser
                                </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Plus className="w-3 h-3 text-emerald-500" />
                                </div>
                                <p className="text-[10px] font-bold text-foreground">
                                    Select <span className="text-emerald-500">Install Gym Tracker</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex border-t border-border divide-x divide-border">
                    <button
                        onClick={onCancel}
                        className={`py-3.5 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:bg-secondary/50 transition-colors ${hasPrompt ? 'flex-1' : 'w-full'}`}
                    >
                        {hasPrompt ? 'Later' : 'Got it'}
                    </button>
                    {hasPrompt && (
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Add to Home
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstallAppModal;
