import React from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';

const ExpenseLog = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center mb-6 shadow-inner">
                <CreditCard className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-[16px] font-black uppercase tracking-tight text-foreground mb-3">Expense Logging Coming Soon</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium max-w-sm">
                We're building a powerful way to track your daily spending against your budget. Stay tuned!
            </p>
        </div>
    );
};

export default ExpenseLog;
