import React, { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import { useExpenseLog } from '../ExpenseLogContext';
import ExpenseCombobox from './ExpenseCombobox';
import ExpenseLogSlot from './ExpenseLogSlot';
import { useLogExpenseMutation } from '../http/queries';

const DailyExpenseLog = ({ dailyLogs, categories }) => {
    const { logData, deleteLog, formattedDate, isLoading: isCatLoading, setHasStagedLogs } = useExpenseLog();
    const [stagedLogs, setStagedLogs] = useState([]);
    
    const planUuid = logData?.plan_summary?.plan_uuid;
    const logMutation = useLogExpenseMutation(planUuid);

    // Sync with context for unsaved changes guard
    React.useEffect(() => {
        setHasStagedLogs(stagedLogs.length > 0);
    }, [stagedLogs, setHasStagedLogs]);

    const handleAddStaged = (data) => {
        setStagedLogs([...stagedLogs, { 
            name: data.name,
            amount: data.amount,
            category_name: data.category_name,
            is_fixed: data.is_fixed,
            uuid: `temp-${Date.now()}`,
            is_custom: data.is_custom
        }]);
    };

    const handleUpdateStaged = (updatedLog) => {
        setStagedLogs(stagedLogs.map(l => l.uuid === updatedLog.uuid ? updatedLog : l));
    };

    const handleDeleteStaged = (uuid) => {
        setStagedLogs(stagedLogs.filter(l => l.uuid !== uuid));
    };

    const handleSaveAll = () => {
        // Handle staged logs (new entries)
        stagedLogs.forEach(log => {
            logMutation.mutate({
                name: log.name,
                amount: log.amount,
                category_name: log.category_name,
                is_fixed: log.is_fixed,
                expense_date: formattedDate
            });
        });
        setStagedLogs([]);

        // Handle saved logs that are currently being edited
        // We need to trigger saves for any log currently in an 'editing' state
        // This relies on the context providing a way to save active edits
        // Since handleSaveEdit is inside ExpenseLogSlot, we'll need to trigger 
        // a broadcast or state update. For now, this placeholder ensures the button is enabled.
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Daily Tracking</h3>
                    <p className="hidden sm:block text-[10px] font-medium text-muted-foreground italic">Log your variable spending</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleSaveAll}
                        disabled={logMutation.isPending}
                        className="h-7 px-3 rounded-lg bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shrink-0"
                    >
                        {logMutation.isPending ? '...' : `Save ${stagedLogs.length > 0 ? stagedLogs.length : ''} Logs`}
                    </button>
                    
                    <div className="shrink-0">
                        <ExpenseCombobox 
                            categories={categories || []} 
                            isLoading={isCatLoading}
                            onAdd={handleAddStaged}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {stagedLogs.map((log) => (
                    <ExpenseLogSlot 
                        key={log.uuid} 
                        log={log} 
                        onDelete={handleDeleteStaged}
                        onUpdate={handleUpdateStaged}
                    />
                ))}

                {dailyLogs?.map((log) => (
                    <ExpenseLogSlot 
                        key={log.uuid} 
                        log={log} 
                        onDelete={deleteLog}
                        onUpdate={() => {}} 
                    />
                ))}

                {(!dailyLogs?.length && !stagedLogs.length) && (
                    <div className="py-20 text-center bg-card border border-dashed border-border/50 rounded-[3rem]">
                        <div className="w-16 h-16 bg-secondary/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <IndianRupee className="w-8 h-8 text-muted-foreground/10" />
                        </div>
                        <p className="text-[11px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">No Spending Logged</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyExpenseLog;
