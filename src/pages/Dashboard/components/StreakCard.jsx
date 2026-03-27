import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '../../../lib/utils';

const StreakCard = ({ streak }) => {
    const weekDays = streak?.week_days || [];
    const currentStreak = streak?.current_streak || 0;
    const weekProgress = streak?.week_progress || 0;

    return (
        <div className="bg-card border border-border rounded-3xl p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase italic text-foreground">
                            {currentStreak} Day Streak
                        </h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            Keep it going!
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">This Week</span>
                    <p className="text-[12px] font-black italic text-primary">{weekProgress}%</p>
                </div>
            </div>

            <div className="flex justify-between gap-1">
                {weekDays.map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-1.5">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">
                            {day.day}
                        </span>
                        <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                            day.completed 
                                ? "bg-primary text-white" 
                                : day.is_today 
                                    ? "bg-secondary text-muted-foreground animate-pulse" 
                                    : "bg-secondary/30 text-muted-foreground"
                        )}>
                            {day.completed ? "✓" : day.is_today ? "•" : ""}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${weekProgress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default StreakCard;
