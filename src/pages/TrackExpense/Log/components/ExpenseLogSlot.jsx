import React from 'react';
import { Trash2, DollarSign, ChevronDown, Check, Edit2, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { useExpenseLog } from '../ExpenseLogContext';

const ExpenseLogSlot = ({ log }) => {
    const { 
        updateExistingLog, 
        updateStagedLog, 
        deleteStagedLog, 
        deleteLog,
        editedLogs,
        editingUuids,
        setEditing
    } = useExpenseLog();
    
    const isSaved = !!log.uuid && !log.uuid.toString().startsWith('temp-');
    const isStaged = !!log.tempId;
    const isEditing = isSaved && editingUuids.has(log.uuid);
    
    // Display data is either from editedLogs map or the log object itself
    const displayData = isSaved ? (editedLogs[log.uuid] || log) : log;
    const isModified = isSaved && !!editedLogs[log.uuid];

    const handleUpdate = (field, value) => {
        if (isSaved) {
            updateExistingLog(log.uuid, { [field]: value });
        } else if (isStaged) {
            updateStagedLog(log.tempId, { [field]: value });
        }
    };

    const handleDelete = () => {
        if (isSaved) {
            deleteLog(log.uuid);
        } else if (isStaged) {
            deleteStagedLog(log.tempId);
        }
    };

    // Rule: Saved items can only edit amount. Name and Type are locked.
    // Staged items can edit everything.
    const isNameReadOnly = isSaved; 
    const isTypeReadOnly = isSaved;
    const isAmountReadOnly = isSaved && !isEditing;

    return (
        <div className={cn(
            "group flex flex-col sm:flex-row sm:items-start justify-between p-3 rounded-2xl transition-all gap-3 sm:gap-4",
            isEditing || isStaged ? "bg-emerald-500/5 border-emerald-500/20 border" : "bg-secondary/10 border border-emerald-800/50 hover:border-border"
        )}>
            {/* Left: Icon + Name */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 shadow-sm mt-0.5 transition-colors",
                    isEditing || isStaged ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-emerald-600"
                )}>
                    <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={displayData.category_name || ''}
                        onChange={(e) => handleUpdate('category_name', e.target.value)}
                        readOnly={isNameReadOnly}
                        placeholder="Expense Name"
                        className={cn(
                            "w-full h-8 px-3 rounded-xl text-[13px] font-bold outline-none transition-all bg-transparent border-none text-foreground tracking-tight italic",
                            (isModified || isStaged) && "text-emerald-600",
                            isNameReadOnly ? "cursor-default" : "focus:ring-1 focus:ring-emerald-500/30"
                        )}
                    />
                </div>
            </div>

            {/* Right: Type Toggle | Amount | Delete */}
            <div className="flex items-start justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 border-border/10 pt-3 sm:pt-0 shrink-0">
                
                {/* Type Toggle */}
                {isTypeReadOnly ? (
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 rounded-xl shrink-0 h-6 mt-0.5">
                        <span className="text-[9px] font-black text-emerald-600 tracking-tighter uppercase">
                            {displayData.is_fixed ? 'Fixed' : 'Variable'}
                        </span>
                    </div>
                ) : (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 rounded-xl shrink-0 h-6 mt-0.5 hover:bg-emerald-500/20 transition-colors">
                                <span className="text-[9px] font-black text-emerald-600 tracking-tighter uppercase">
                                    {displayData.is_fixed ? 'Fixed' : 'Variable'}
                                </span>
                                <ChevronDown className="w-2.5 h-2.5 text-emerald-600/50" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-32 p-1" align="end">
                            <button
                                onClick={() => handleUpdate('is_fixed', false)}
                                className={cn("w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[10px] font-bold hover:bg-secondary", !displayData.is_fixed && "text-emerald-600")}
                            >
                                Variable {!displayData.is_fixed && <Check className="w-3 h-3" />}
                            </button>
                            <button
                                onClick={() => handleUpdate('is_fixed', true)}
                                className={cn("w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[10px] font-bold hover:bg-secondary", displayData.is_fixed && "text-emerald-600")}
                            >
                                Fixed {displayData.is_fixed && <Check className="w-3 h-3" />}
                            </button>
                        </PopoverContent>
                    </Popover>
                )}

                {/* Amount */}
                <div className="flex flex-col items-end">
                    <div className={cn(
                        "flex items-center gap-2 rounded-xl px-3 h-8 min-w-[100px] sm:min-w-[110px] transition-all bg-background border",
                        isAmountReadOnly ? "border-border/50 bg-transparent" : "border-emerald-500/30 ring-1 ring-emerald-500/10"
                    )}>
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0">₹</span>
                        <input 
                            type="number"
                            value={displayData.amount || ''}
                            onChange={(e) => handleUpdate('amount', e.target.value)}
                            readOnly={isAmountReadOnly}
                            className={cn(
                                "w-full bg-transparent border-none p-0 text-[12px] font-black outline-none text-right focus:ring-0 text-foreground italic",
                                !isAmountReadOnly && "text-emerald-600"
                            )}
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Actions: Edit + Delete */}
                <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                    {isSaved && (
                        <button 
                            onClick={() => setEditing(log.uuid, !isEditing)}
                            className={cn(
                                "transition-all p-1.5 rounded-lg",
                                isEditing ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
                            )}
                        >
                            {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                        </button>
                    )}
                    <button 
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-500/60 transition-all p-1.5"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseLogSlot;