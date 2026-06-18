import React from 'react';
import { CheckCircle2, CreditCard, ArrowRight, Zap } from 'lucide-react';
import { useExpenseLog } from '../ExpenseLogContext';
import { cn } from '../../../../lib/utils';

const CommitmentItem = ({ commitment }) => {
    const { logExpense, isLogging, formattedDate } = useExpenseLog();

    const handlePaid = () => {
        if (commitment.is_paid) return;
        
        logExpense({
            expense_date: formattedDate,
            expenses: [{
                category_name: commitment.name,
                amount: commitment.amount,
                is_fixed: true
            }]
        });
    };

    return (
        <div className={cn(
            "flex-shrink-0 w-[140px] sm:w-[160px] group relative rounded-3xl border transition-all duration-300 p-3 sm:p-4",
            commitment.is_paid 
                ? "bg-emerald-500/5 border-emerald-500/20" 
                : "bg-card border-border/50 hover:border-emerald-500/30"
        )}>
            <div className="flex items-center justify-between mb-3">
                <div className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center transition-colors",
                    commitment.is_paid ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground/50"
                )}>
                    <CreditCard className="w-3.5 h-3.5" />
                </div>
                {commitment.is_paid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            </div>
            
            <div className="min-w-0">
                <h4 className="text-[10px] font-black text-foreground truncate mb-0.5">
                    {commitment.name}
                </h4>
                <p className="text-sm font-black text-foreground tracking-tighter">
                    ₹{commitment.amount.toLocaleString()}
                </p>
            </div>

            {!commitment.is_paid ? (
                <button 
                    onClick={handlePaid}
                    disabled={isLogging}
                    className="mt-3 w-full h-7 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                    Pay
                    <Zap className="w-2.5 h-2.5" />
                </button>
            ) : (
                <div className="mt-3 w-full flex items-center justify-center gap-1 rounded-xl bg-emerald-500/10 py-1.5">
                    <span className="text-[10px] font-black uppercase text-emerald-600 truncate">{commitment.paid_date || 'Paid'}</span>
                </div>
            )}
        </div>
    );
};

const CommitmentSlide = ({ commitments }) => {
    if (!commitments || commitments.length === 0) return null;

    const paidCount = commitments.filter(c => c.is_paid).length;
    const progress = (paidCount / commitments.length) * 100;

    return (
        <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-black text-foreground">Commitments</h3>
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md">
                        {paidCount}/{commitments.length}
                    </span>
                </div>
                <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                {commitments.map((commitment) => (
                    <CommitmentItem key={commitment.uuid} commitment={commitment} />
                ))}
            </div>
        </div>
    );
};

export default CommitmentSlide;
