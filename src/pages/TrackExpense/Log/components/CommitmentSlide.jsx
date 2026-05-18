import React from 'react';
import { CheckCircle2, CreditCard, ArrowRight } from 'lucide-react';
import { useExpenseLog } from '../ExpenseLogContext';
import { cn } from '../../../../lib/utils';

const CommitmentItem = ({ commitment }) => {
    const { logExpense, isLogging } = useExpenseLog();

    const handlePaid = () => {
        if (commitment.is_paid) return;
        
        logExpense({
            category_uuid: commitment.uuid,
            name: commitment.name,
            amount: commitment.amount,
            is_fixed: true
        });
    };

    return (
        <div className={cn(
            "flex-shrink-0 w-[180px] sm:w-[220px] group relative overflow-hidden rounded-[2rem] border transition-all duration-300",
            commitment.is_paid 
                ? "bg-emerald-500/5 border-emerald-500/10" 
                : "bg-card border-border/50 hover:border-emerald-500/30"
        )}>
            <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                        commitment.is_paid ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground/50 group-hover:text-emerald-500 group-hover:bg-emerald-500/10"
                    )}>
                        <CreditCard className="w-4 h-4" />
                    </div>
                    {commitment.is_paid && (
                        <div className="flex items-center gap-1 text-emerald-500 animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-4 h-4 fill-emerald-500/10" />
                        </div>
                    )}
                </div>
                
                <div className="min-w-0">
                    <h4 className="text-[12px] font-black tracking-tight text-foreground truncate uppercase mb-1">
                        {commitment.name}
                    </h4>
                    <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground/40 italic">₹</span>
                        <span className="text-base font-black text-foreground tracking-tighter">
                            {commitment.amount.toLocaleString()}
                        </span>
                    </div>
                </div>

                {!commitment.is_paid ? (
                    <button 
                        onClick={handlePaid}
                        disabled={isLogging}
                        className="mt-4 w-full h-8 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-emerald-600/20"
                    >
                        Mark Paid
                        <ArrowRight className="w-3 h-3" />
                    </button>
                ) : (
                    <div className="mt-4 w-full h-8 rounded-xl bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border border-emerald-500/20">
                        Completed
                    </div>
                )}
            </div>
            
            {!commitment.is_paid && (
                <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            )}
        </div>
    );
};

const CommitmentSlide = ({ commitments }) => {
    if (!commitments || commitments.length === 0) return null;

    const paidCount = commitments.filter(c => c.is_paid).length;
    const progress = (paidCount / commitments.length) * 100;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Fixed Commitments</h3>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
                            {paidCount}/{commitments.length}
                        </span>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground italic">Monthly recurring bills</p>
                </div>
                
                <div className="w-20 sm:w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Carousel Container */}
            <div className="relative group">
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                    {commitments.map((commitment) => (
                        <CommitmentItem key={commitment.uuid} commitment={commitment} />
                    ))}
                </div>
                
                {/* Visual Indicators for Scroll */}
                <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-background to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-background to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
};

export default CommitmentSlide;
