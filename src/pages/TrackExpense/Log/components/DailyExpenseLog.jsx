import React, { useState } from 'react';
import { Plus, Trash2, Tag, IndianRupee, X } from 'lucide-react';
import { useExpenseLog } from '../ExpenseLogContext';
import ExpenseCombobox from './ExpenseCombobox';
import { toast } from 'sonner';

const DailyExpenseLog = ({ dailyLogs, categories }) => {
    const { logExpense, deleteLog, isLogging, formattedDate, isLoading: isCatLoading } = useExpenseLog();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', amount: '', category_name: '' });

    const handleAddExpense = () => {
        if (!formData.name || !formData.amount || !formData.category_name) {
            toast.error('Please fill in all fields (Name, Amount, Category)');
            return;
        }

        logExpense({
            ...formData,
            expense_date: formattedDate
        });

        setFormData({ name: '', amount: '', category_name: '' });
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Daily Tracking</h3>
                    <p className="text-[10px] font-medium text-muted-foreground italic">Log your variable spending</p>
                </div>
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        Log Expense
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-card border-2 border-emerald-500/20 rounded-[2.5rem] p-6 space-y-5 animate-in slide-in-from-top-4 duration-300 shadow-xl shadow-emerald-500/5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">New Expense Entry</h4>
                        </div>
                        <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                            <X className="w-4 h-4 text-muted-foreground/40" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Expense Detail</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="e.g. Starbucks, Grocery"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-11 bg-secondary/50 border-none rounded-2xl px-4 text-[11px] font-bold text-foreground outline-none focus:ring-2 ring-emerald-500/20 transition-all placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Amount</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                                <input 
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full h-11 bg-secondary/50 border-none rounded-2xl pl-10 pr-4 text-[11px] font-bold text-foreground outline-none focus:ring-2 ring-emerald-500/20 transition-all placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Category Group</label>
                        <ExpenseCombobox 
                            categories={categories} 
                            isLoading={isCatLoading}
                            onSelect={(cat) => setFormData({ ...formData, category_name: cat.name })}
                        />
                    </div>

                    <div className="flex items-center gap-3 justify-end pt-2">
                        <button 
                            onClick={() => setIsAdding(false)}
                            className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={handleAddExpense}
                            disabled={isLogging}
                            className="h-10 px-8 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                        >
                            {isLogging ? 'Processing...' : 'Confirm Expense'}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {dailyLogs?.length > 0 ? (
                    dailyLogs.map((log) => (
                        <div key={log.uuid} className="group bg-card border border-border/50 rounded-3xl p-4 flex items-center justify-between hover:border-emerald-500/30 transition-all shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-600 transition-all duration-300">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-black tracking-tight text-foreground uppercase">{log.name}</h4>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{log.category_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-sm font-black text-foreground tracking-tighter">₹{log.amount.toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">Logged</p>
                                </div>
                                <button 
                                    onClick={() => deleteLog(log.uuid)}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all sm:opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-card border border-dashed border-border/50 rounded-[3rem]">
                        <div className="w-16 h-16 bg-secondary/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <IndianRupee className="w-8 h-8 text-muted-foreground/10" />
                        </div>
                        <p className="text-[11px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">No Variable Spending Logged</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyExpenseLog;
