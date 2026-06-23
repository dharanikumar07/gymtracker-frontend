import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Wallet, Clock, Target, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const typeConfig = {
    workout: { icon: Dumbbell, color: 'bg-primary/10 text-primary', route: '/track-workouts/log' },
    expense: { icon: Wallet, color: 'bg-emerald-500/10 text-emerald-500', route: '/track-expense/log' },
};

const RecentActivity = ({ recent }) => {
    const navigate = useNavigate();
    const activities = recent || [];

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 pb-2 shrink-0">
                <p className="text-[13px] font-black tracking-tight text-foreground">Recent Activity</p>
                <button
                    onClick={() => navigate('/analytics/overview')}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary hover:opacity-80 transition-opacity"
                >
                    View all <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            {activities.length > 0 ? (
                <div className="px-4 pb-4 space-y-2 overflow-y-auto max-h-[340px] scrollbar-hide no-scrollbar">
                    {activities.map((item, i) => {
                        const config = typeConfig[item.type] || typeConfig.workout;
                        const Icon = config.icon;
                        return (
                            <button
                                key={i}
                                onClick={() => navigate(config.route)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors"
                            >
                                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.color)}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-[11px] font-bold text-foreground truncate">{item.title}</p>
                                    <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        {formatDate(item.date)}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="px-4 pb-6 pt-2 text-center">
                    <Target className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-muted-foreground">
                        No activity yet. Start by logging a workout or expense.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RecentActivity;
