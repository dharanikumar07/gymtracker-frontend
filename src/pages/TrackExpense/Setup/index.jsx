import React from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import FixedExpenses from './components/FixedExpenses';
import BudgetPlanCard from './components/BudgetPlanCard';

const ExpenseSetupContent = () => {
    const { plans } = useExpense();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Budget Plan Section */}
            <div className="space-y-4">
                <div className="flex flex-col px-1">
                    <h3 className="text-[13px] font-black uppercase tracking-tight text-foreground leading-normal mb-1">Budget Framework</h3>
                    <p className="text-[10px] font-bold text-muted-foreground tracking-widest opacity-80">Define your spending limits and cycles</p>
                </div>

                <BudgetPlanCard />
            </div>

            {/* 2. Fixed Commitments Section */}
            {plans.length > 0 && <FixedExpenses />}
        </div>
    );
};

const ExpenseSetup = () => (
    <ExpenseProvider>
        <ExpenseSetupContent />
    </ExpenseProvider>
);

export default ExpenseSetup;