import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
    Rocket,
    Check,
    ChevronDown,
    ChevronUp,
    User,
    Dumbbell,
    UtensilsCrossed,
    Wallet,
    CreditCard,
    ArrowRight,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const iconMap = {
    profile: User,
    fitness: Dumbbell,
    diet: UtensilsCrossed,
    budget: Wallet,
    billing: CreditCard,
};

const QuickStartChecklist = ({ quickStart }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(true);

    const items = quickStart?.items || [];
    const completed = quickStart?.completed || 0;
    const total = quickStart?.total || 0;
    const isComplete = quickStart?.is_complete || false;
    const percentage = quickStart?.percentage || 0;

    const routeMap = {
        profile: '/profile',
        fitness: '/workout',
        diet: '/diet',
        budget: '/expenses',
        billing: '/billing',
    };

    return (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isComplete ? "bg-green-500/10" : "bg-primary/10"
                    )}>
                        <Rocket className={cn(
                            "w-5 h-5",
                            isComplete ? "text-green-500" : "text-primary"
                        )} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-[11px] font-black uppercase italic text-foreground">
                            Quick Start
                        </h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            {isComplete ? 'All complete!' : `${completed}/${total} completed`}
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
            </button>

            {isExpanded && (
                <>
                    <div className="px-4 pb-2">
                        <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                            <div 
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    isComplete ? "bg-green-500" : "bg-primary"
                                )}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="p-4 pt-2 space-y-2">
                        {items.map((item) => {
                            const Icon = iconMap[item.id] || Check;
                            return (
                                <div 
                                    key={item.id}
                                    className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                                    onClick={() => navigate(routeMap[item.id])}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                            item.completed ? "bg-green-500/10" : "bg-secondary"
                                        )}>
                                            {item.completed ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Icon className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[11px] font-bold",
                                            item.completed ? "text-muted-foreground line-through" : "text-foreground"
                                        )}>
                                            {item.title}
                                        </span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default QuickStartChecklist;
