import React from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import BudgetPlanCard from './components/BudgetPlanCard';
import FixedExpenses from './components/FixedExpenses';
import { Wallet, Loader2, Target } from 'lucide-react';

const SetupContent = () => {
    const { isLoadingPlans, isLoadingExpenses } = useExpense();

    if (isLoadingPlans || isLoadingExpenses) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 animate-in fade-in duration-500">
            {/* ─── Budget Setup Section ─── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-foreground uppercase italic flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Budget Setup
                        </h2>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-7">
                            Configure your financial ceiling for the period
                        </p>
                    </div>
                </div>

                <BudgetPlanCard />
            </div>

            {/* ─── Fixed Expenses Section ─── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-foreground uppercase italic flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            Fixed Commitments
                        </h2>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-7">
                            Recurring monthly costs that are non-negotiable
                        </p>
                    </div>
                </div>
                
                <FixedExpenses />
            </div>
        </div>
    );
};

const ExpenseSetup = () => {
    return (
        <ExpenseProvider>
            <SetupContent />
        </ExpenseProvider>
    );
};

export default ExpenseSetup;
