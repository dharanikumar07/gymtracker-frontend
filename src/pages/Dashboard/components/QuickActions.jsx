import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Dumbbell,
    UtensilsCrossed,
    Wallet,
    ClipboardList,
    CreditCard,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const iconMap = {
    dumbbell: Dumbbell,
    utensils: UtensilsCrossed,
    wallet: Wallet,
    'clipboard-list': ClipboardList,
    'credit-card': CreditCard,
};

const QuickActions = ({ actions }) => {
    const navigate = useNavigate();

    return (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {actions?.map((action) => {
                const Icon = iconMap[action.icon] || Dumbbell;
                return (
                    <button
                        key={action.id}
                        onClick={() => navigate(action.route)}
                        className="flex flex-col items-center gap-2 shrink-0 group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm group-hover:border-primary group-hover:shadow-md group-hover:scale-105 transition-all">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                            {action.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default QuickActions;
