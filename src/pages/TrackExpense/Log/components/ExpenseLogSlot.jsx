import React, { useState } from 'react';
import { Tag, Trash2, DollarSign, ChevronDown, Check, Edit2, Save, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { useExpenseLog } from '../ExpenseLogContext';

const ExpenseLogSlot = ({ log, onDelete, onUpdate }) => {
    const { logExpense, isLogging, setEditing } = useExpenseLog();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...log });
    
    const isSaved = !!log.uuid && !log.uuid.toString().startsWith('temp-');
    const isCustom = !isSaved || log.is_custom;

    const handleToggleEdit = (editing) => {
        setIsEditing(editing);
        setEditing(log.uuid, editing);
    };

    const handleUpdate = (field, value) => {
        if (isSaved) {
            setEditData(prev => ({ ...prev, [field]: value }));
        } else {
            const updatedLog = { ...log, [field]: value };
            if (field === 'name' && log.is_custom) {
                updatedLog.category_name = value;
            }
            onUpdate(updatedLog);
        }
    };

    const handleSaveEdit = () => {
        logExpense({
            name: editData.name,
            amount: editData.amount,
            category_uuid: log.category_uuid,
            category_name: editData.name, // Sync category_name if name changed
            is_fixed: log.is_fixed,
            expense_date: log.expense_date
        }, {
            onSuccess: () => handleToggleEdit(false)
        });
    };

    const isReadOnly = isSaved && !isEditing;

    return (
        <div className={cn(
            "group flex flex-col sm:flex-row sm:items-start justify-between p-3 rounded-2xl transition-all gap-3 sm:gap-4",
            isEditing ? "bg-emerald-500/5 border-emerald-500/20 border" : "bg-secondary/10 border border-emerald-800/50 hover:border-border"
        )}>
            {/* Left: Icon + Name */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 shadow-sm mt-0.5 transition-colors",
                    isEditing ? "bg-emerald-500 text-white border-emerald-500" : "bg-background border-border text-emerald-600"
                )}>
                    <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={isSaved ? editData.name : log.name}
                        onChange={(e) => handleUpdate('name', e.target.value)}
                        readOnly={isReadOnly}
                        placeholder="Expense Name"
                        className={cn(
                            "w-full h-8 px-3 rounded-xl text-[13px] font-bold outline-none transition-all",
                            isReadOnly 
                                ? "bg-transparent border-none text-foreground tracking-tight" 
                                : "bg-background border border-border/50 text-foreground italic focus:ring-1 focus:ring-emerald-500/30"
                        )}
                    />
                </div>
            </div>

            {/* Right: Type Toggle | Amount | Delete */}
            <div className="flex items-start justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 border-border/10 pt-3 sm:pt-0 shrink-0">
                
                {/* Type Toggle */}
                {isCustom && !isSaved ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 rounded-xl shrink-0 h-6 mt-0.5 hover:bg-emerald-500/20 transition-colors">
                                <span className="text-[9px] font-black text-emerald-600 tracking-tighter">
                                    {log.is_fixed ? 'Fixed' : 'Variable'}
                                </span>
                                <ChevronDown className="w-2.5 h-2.5 text-emerald-600/50" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-32 p-1" align="end">
                            <button
                                onClick={() => handleUpdate('is_fixed', false)}
                                className={cn("w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[10px] font-bold hover:bg-secondary", !log.is_fixed && "text-emerald-600")}
                            >
                                Variable {!log.is_fixed && <Check className="w-3 h-3" />}
                            </button>
                            <button
                                onClick={() => handleUpdate('is_fixed', true)}
                                className={cn("w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[10px] font-bold hover:bg-secondary", log.is_fixed && "text-emerald-600")}
                            >
                                Fixed {log.is_fixed && <Check className="w-3 h-3" />}
                            </button>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 rounded-xl shrink-0 h-5 mt-0.5">
                        <span className="text-[9px] font-black text-emerald-600 tracking-tighter">
                            {log.is_fixed ? 'Fixed' : 'Variable'}
                        </span>
                    </div>
                )}

                {/* Amount */}
                <div className="flex flex-col items-end">
                    <div className={cn(
                        "flex items-center gap-2 rounded-xl px-3 h-8 min-w-[100px] sm:min-w-[110px] transition-all",
                        isReadOnly ? "bg-transparent border-none" : "bg-background border border-border/50"
                    )}>
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0">₹</span>
                        <input 
                            type="number"
                            value={isSaved ? editData.amount : log.amount}
                            onChange={(e) => handleUpdate('amount', e.target.value)}
                            readOnly={isReadOnly}
                            className={cn(
                                "w-full bg-transparent border-none p-0 text-[12px] font-black outline-none text-right focus:ring-0",
                                isReadOnly ? "text-foreground" : "text-foreground italic"
                            )}
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Actions: Edit/Save + Delete */}
                <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                    {isSaved && (
                        isEditing ? (
                            <button 
                                onClick={() => handleToggleEdit(false)}
                                className="text-red-500 hover:text-red-600 transition-all p-1.5"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleToggleEdit(true)}
                                className="text-muted-foreground hover:text-emerald-600 transition-all p-1.5"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        )
                    )}
                    <button 
                        onClick={() => onDelete(log.uuid)}
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