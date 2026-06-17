import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Wallet, Flame, TrendingUp } from 'lucide-react';
import { cn } from '../../../lib/utils';

const StatCard = ({ icon: Icon, label, value, sub, color, onClick }) => (
    <button
        onClick={onClick}
        className="flex-1 bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all text-left group"
    >
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", color)}>
            <Icon className="w-4 h-4" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-xl font-black text-foreground mt-0.5 tracking-tight">{value}</p>
        {sub && (
            <p className="text-[10px] font-medium text-muted-foreground mt-1">{sub}</p>
        )}
    </button>
);

const Stats = ({ today, streak }) => {
    const navigate = useNavigate();
    const fitness = today?.fitness || {};
    const budget = today?.budget || {};

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
                icon={Dumbbell}
                label="Today's Workout"
                value={`${fitness.completed || 0}/${fitness.target || 1}`}
                sub={fitness.percentage >= 100 ? 'Completed' : 'In progress'}
                color={fitness.percentage >= 100 ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}
                onClick={() => navigate('/track-progress/workout')}
            />
            <StatCard
                icon={Wallet}
                label="Spent Today"
                value={`₹${budget.spent || 0}`}
                sub={budget.daily_limit > 0 ? `of ₹${Math.round(budget.daily_limit)} limit` : 'No budget set'}
                color={
                    budget.percentage > 100
                        ? 'bg-red-500/10 text-red-500'
                        : budget.percentage > 80
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                }
                onClick={() => navigate('/track-expense/log')}
            />
            <StatCard
                icon={Flame}
                label="Streak"
                value={`${streak?.current_streak || 0} days`}
                sub={`${streak?.week_progress || 0}% this week`}
                color="bg-orange-500/10 text-orange-500"
                onClick={() => navigate('/analytics/workout')}
            />
            <StatCard
                icon={TrendingUp}
                label="Week Progress"
                value={`${streak?.week_progress || 0}%`}
                sub={`${(streak?.week_days || []).filter(d => d.completed).length}/7 days done`}
                color="bg-violet-500/10 text-violet-500"
                onClick={() => navigate('/analytics/overview')}
            />
        </div>
    );
};

export default Stats;
