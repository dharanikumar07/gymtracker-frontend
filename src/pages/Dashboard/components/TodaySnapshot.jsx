import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Dumbbell,
    UtensilsCrossed,
    Wallet,
    Check,
    ArrowRight,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const TodaySnapshot = ({ today }) => {
    const navigate = useNavigate();

    const fitness = today?.fitness || {};
    const diet = today?.diet || {};
    const budget = today?.budget || {};

    const completedCount = [
        fitness?.percentage >= 100,
        diet?.percentage >= 80,
        budget?.percentage <= 100,
    ].filter(Boolean).length;

    return (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-secondary/20">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground">
                        Today's Snapshot
                    </h3>
                    <span className="text-[9px] font-black text-muted-foreground uppercase">
                        {completedCount}/3
                    </span>
                </div>
            </div>

            <div className="p-4 grid grid-cols-3 gap-3">
                <button 
                    onClick={() => navigate('/workout')}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        fitness?.percentage >= 100 ? "bg-green-500/10" : "bg-primary/10"
                    )}>
                        {fitness?.percentage >= 100 ? (
                            <Check className="w-5 h-5 text-green-500" />
                        ) : (
                            <Dumbbell className="w-5 h-5 text-primary" />
                        )}
                    </div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground">Workout</span>
                    <span className="text-[10px] font-black italic text-foreground">
                        {fitness?.completed || 0}/{fitness?.target || 1}
                    </span>
                </button>

                <button 
                    onClick={() => navigate('/diet')}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                    <div className="relative w-10 h-10">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="20" cy="20" r="16" strokeWidth="4" stroke="currentColor" className="text-secondary" fill="none" />
                            <circle
                                cx="20"
                                cy="20"
                                r="16"
                                strokeWidth="4"
                                strokeLinecap="round"
                                stroke="currentColor"
                                className="text-green-500 transition-all"
                                fill="none"
                                strokeDasharray={`${(diet?.percentage || 0) * 1} 100`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <UtensilsCrossed className="w-4 h-4 text-green-500" />
                        </div>
                    </div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground">Diet</span>
                    <span className="text-[10px] font-black italic text-foreground">
                        {diet?.consumed || 0}
                    </span>
                </button>

                <button 
                    onClick={() => navigate('/expenses')}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        budget?.percentage > 100 ? "bg-red-500/10" : budget?.percentage > 80 ? "bg-yellow-500/10" : "bg-primary/10"
                    )}>
                        <Wallet className={cn(
                            "w-5 h-5",
                            budget?.percentage > 100 ? "text-red-500" : budget?.percentage > 80 ? "text-yellow-500" : "text-primary"
                        )} />
                    </div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground">Budget</span>
                    <span className="text-[10px] font-black italic text-foreground">
                        ₹{budget?.spent || 0}
                    </span>
                </button>
            </div>

            <div className="px-4 pb-4">
                <button 
                    onClick={() => navigate('/analytics')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                    <span className="text-[9px] font-black uppercase tracking-wider">View Details</span>
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default TodaySnapshot;
