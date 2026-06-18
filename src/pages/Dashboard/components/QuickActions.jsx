import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Home } from 'lucide-react';
import { usePwaInstall } from '../../../hooks/usePwaInstall';
import InstallAppModal from './InstallAppModal';

const QuickActions = () => {
    const navigate = useNavigate();
    const { canShowIcon, hasPrompt, needsManualGuide, promptInstall, dismiss } = usePwaInstall();
    const [showModal, setShowModal] = useState(false);

    const handleInstall = async () => {
        if (hasPrompt) {
            const outcome = await promptInstall();
            setShowModal(false);
            if (outcome === 'accepted') dismiss();
        } else {
            // Safari or no native prompt — just close modal
            setShowModal(false);
        }
    };

    return (
        <div className="flex gap-2.5">
            <button
                onClick={() => navigate('/track-progress/workout')}
                className="flex items-center gap-2 h-9 px-4 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.97]"
            >
                <Plus className="w-3.5 h-3.5" />
                Log Workout
            </button>
            <button
                onClick={() => navigate('/track-expense/log')}
                className="flex items-center gap-2 h-9 px-4 rounded-full border border-border bg-card text-foreground text-[10px] font-bold uppercase tracking-wider hover:bg-secondary/50 transition-all active:scale-[0.97]"
            >
                <Plus className="w-3.5 h-3.5" />
                Log Expense
            </button>
            {canShowIcon && (
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card text-foreground hover:bg-secondary/50 transition-all active:scale-[0.97]"
                    title="Install App"
                >
                    <Home className="w-3.5 h-3.5" />
                </button>
            )}

            {showModal && (
                <InstallAppModal
                    hasPrompt={hasPrompt}
                    needsManualGuide={needsManualGuide}
                    onCancel={() => setShowModal(false)}
                    onConfirm={handleInstall}
                />
            )}
        </div>
    );
};

export default QuickActions;
