import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Clock,
    Dumbbell,
    UtensilsCrossed,
    Wallet,
    ArrowRight,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const iconMap = {
    workout: Dumbbell,
    diet: UtensilsCrossed,
    expense: Wallet,
};

const colorMap = {
    workout: 'bg-primary/10 text-primary',
    diet: 'bg-green-500/10 text-green-500',
    expense: 'bg-red-500/10 text-red-500',
};

const routeMap = {
    workout: '/workout',
    diet: '/diet',
    expense: '/expenses',
};

const RecentActivity = ({ recent }) => {
    const navigate = useNavigate();
    const activities = recent || [];

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        return diffHours < 1 
            ? 'Just now' 
            : diffHours < 24 
                ? `${diffHours}h ago` 
                : diffDays === 1 
                    ? 'Yesterday' 
                    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-secondary/20">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground">
                        Recent Activity
                    </h3>
                    <button 
                        onClick={() => navigate('/analytics')}
                        className="flex items-center gap-1 text-[9px] font-black text-primary uppercase hover:opacity-80 transition-opacity"
                    >
                        See All <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {activities.length > 0 ? activities.map((activity, index) => {
                    const Icon = iconMap[activity.type] || Clock;
                    const colorClass = colorMap[activity.type] || 'bg-secondary text-muted-foreground';
                    const route = routeMap[activity.type];

                    return (
                        <button
                            key={index}
                            onClick={() => navigate(route)}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClass)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-black text-foreground uppercase italic">
                                        {activity.title}
                                    </p>
                                    <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(activity.date)}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[12px] font-black italic text-foreground">
                                {activity.value}
                            </span>
                        </button>
                    );
                }) : (
                    <div className="py-8 text-center">
                        <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">
                            No recent activity
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
