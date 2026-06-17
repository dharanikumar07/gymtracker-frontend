import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const QuickActions = () => {
    const navigate = useNavigate();
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
        </div>
    );
};

export default QuickActions;
