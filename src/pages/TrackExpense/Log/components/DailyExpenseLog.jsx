import React, { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import { useExpenseLog } from '../ExpenseLogContext';
import ExpenseCombobox from './ExpenseCombobox';
import ExpenseLogSlot from './ExpenseLogSlot';
import { cn } from '../../../../lib/utils';

const DailyExpenseLog = ({ dailyLogs, categories }) => {
    const { 
        logData, 
        formattedDate, 
        isLoading: isCatLoading, 
        stagedLogs, 
        editedLogs, 
        logExpense, 
        isLogging,
        clearUnsavedChanges
    } = useExpenseLog();
    
    const handleSaveAll = () => {
        // Collect new logs (removing tempId)
        const newExpenses = stagedLogs.map(({ tempId, ...rest }) => ({
            ...rest,
            amount: parseFloat(rest.amount) || 0
        }));

        // Collect edited logs
        const updatedExpenses = Object.values(editedLogs).map(log => ({
            uuid: log.uuid,
            category_name: log.category_name,
            amount: parseFloat(log.amount) || 0,
            is_fixed: log.is_fixed
        }));

        const expenses = [...newExpenses, ...updatedExpenses];

        if (expenses.length === 0) return;

        logExpense({
            expense_date: formattedDate,
            expenses
        }, {
            onSuccess: () => {
                clearUnsavedChanges();
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h3 className="text-xs font-black text-foreground">Daily Tracking</h3>
                    <p className="hidden sm:block text-[10px] font-medium text-muted-foreground italic">Log your variable spending</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleSaveAll}
                        disabled={isLogging || (stagedLogs.length === 0 && Object.keys(editedLogs).length === 0)}
                        className={cn(
                            "h-7 px-3 rounded-lg text-white text-[8px] font-black uppercase tracking-widest transition-all shrink-0",
                            isLogging || (stagedLogs.length === 0 && Object.keys(editedLogs).length === 0)
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                        )}
                    >
                        {isLogging ? 'Saving...' : `Save ${stagedLogs.length + Object.keys(editedLogs).length || ''} Changes`}
                    </button>
                    
                    <div className="shrink-0">
                        <ExpenseCombobox 
                            categories={categories || []} 
                            isLoading={isCatLoading}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {/* Render staged logs first */}
                {stagedLogs.map((log) => (
                    <ExpenseLogSlot key={log.tempId} log={log} />
                ))}

                {/* Render saved logs */}
                {dailyLogs?.map((log) => (
                    <ExpenseLogSlot key={log.uuid} log={log} />
                ))}

                {(!dailyLogs?.length && !stagedLogs.length) && (
                    <div className="py-20 text-center bg-card border border-dashed border-border/50 rounded-[3rem]">
                        <div className="w-16 h-16 bg-secondary/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <IndianRupee className="w-8 h-8 text-muted-foreground/10" />
                        </div>
                        <p className="text-[11px] font-black text-muted-foreground/30">No Spending Logged</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyExpenseLog;
