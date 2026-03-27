import React, { useState, useMemo } from 'react';
import { Wallet, Plus, ShoppingCart, Loader2, Save, ChevronDown, Trash2, X, Target, Calendar, Flame, Timer } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useExpensesQuery, useLogExpenseMutation, useDeleteExpenseMutation, useBudgetPlansQuery, useBudgetPlanStatusQuery } from '../http/queries';

const Track = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isManualCategory, setIsManualCategory] = useState(false);
    const [formData, setFormData] = useState({ uuid: null, name: '', category_type: '', amount: '', expense_period: 'variable' });

    const { data: expenseData, isLoading } = useExpensesQuery(selectedDate);
    const logMutation = useLogExpenseMutation();
    const deleteMutation = useDeleteExpenseMutation();
    const { data: budgetPlansData } = useBudgetPlansQuery();
    const activeBudget = budgetPlansData?.data?.find(plan => plan.is_active);
    const { data: budgetStatusData, isLoading: budgetLoading } = useBudgetPlanStatusQuery(activeBudget?.uuid);

    const categories = expenseData?.all_categories || [];
    const summary = expenseData?.summary || { variable_spend: 0, fixed_commitment: 0, total_spend: 0 };
    const stats = budgetStatusData?.data?.stats;
    const plan = budgetStatusData?.data?.plan;
    const progressPercent = stats ? Math.min((stats.days_passed / stats.total_days) * 100, 100) : 0;
    const spentPercent = stats && stats.budget_amount > 0 ? Math.min((stats.total_spent / stats.budget_amount) * 100, 100) : 0;

    const weekDays = useMemo(() => {
        const baseDate = new Date(selectedDate);
        const day = baseDate.getDay();
        const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(baseDate.setDate(diff));
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const iso = date.toISOString().split('T')[0];
            return { date: iso, dayNum: date.getDate(), dayName: date.toLocaleDateString('en-US', { weekday: 'short' }), isToday: iso === new Date().toISOString().split('T')[0] };
        });
    }, [selectedDate]);

    const handleLogExpense = async (e) => {
        e.preventDefault();
        await logMutation.mutateAsync({ ...formData, expense_date: selectedDate });
        setFormData({ uuid: null, name: '', category_type: '', amount: '', expense_period: 'variable' });
        setIsAddFormOpen(false);
        setIsManualCategory(false);
    };

    if (isLoading && !expenseData) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center bg-secondary/30 rounded-2xl p-1 gap-0.5">
                {weekDays.map((day) => {
                    const isActive = selectedDate === day.date;
                    return (
                        <button key={day.date} onClick={() => setSelectedDate(day.date)} className={cn(
                            "flex-1 flex flex-col items-center py-2 rounded-xl transition-all",
                            isActive ? "bg-primary text-white shadow-sm" : "bg-transparent text-muted-foreground hover:bg-background hover:text-primary"
                        )}>
                            <span className="text-[7px] font-black uppercase tracking-widest mb-0.5">{day.dayName}</span>
                            <span className="text-xs font-black italic">{day.dayNum}</span>
                        </button>
                    );
                })}
            </div>

            <div className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase italic text-foreground">{plan?.name || 'No Active Budget'}</h3>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                {budgetLoading ? 'Loading...' : stats ? `₹${stats.remaining_amount?.toLocaleString()} remaining` : 'Create a budget plan'}
                            </p>
                        </div>
                    </div>
                    {stats && (
                        <div className="text-right">
                            <p className="text-[11px] font-black text-muted-foreground">Used</p>
                            <p className={cn("text-[14px] font-black italic", spentPercent > 100 ? 'text-red-500' : 'text-green-500')}>{Math.round(spentPercent)}%</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {[{ label: 'Variable', val: summary.variable_spend }, { label: 'Fixed', val: summary.fixed_commitment }, { label: 'Total', val: summary.total_spend, dark: true }].map((s, i) => (
                    <div key={i} className={cn("border rounded-2xl p-3 flex flex-col justify-center min-h-[80px] shadow-sm", s.dark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-card border-border")}>
                        <p className={cn("text-[7px] font-black uppercase tracking-widest mb-1", s.dark ? "text-zinc-400" : "text-muted-foreground")}>{s.label}</p>
                        <h4 className="text-base sm:text-lg font-black italic">₹{s.val.toLocaleString()}</h4>
                    </div>
                ))}
            </div>

            {!isAddFormOpen ? (
                <button onClick={() => setIsAddFormOpen(true)} className="w-full h-14 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                    <Plus className="w-5 h-5" /> Add Expense
                </button>
            ) : (
                <div className="bg-card border border-border rounded-3xl p-4 shadow-sm animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 italic"><Plus className="w-3.5 h-3.5" /> {formData.uuid ? 'Modify' : 'Add'} Expense</h3>
                        <button onClick={() => { setIsAddFormOpen(false); setIsManualCategory(false); setFormData({ uuid: null, name: '', category_type: '', amount: '', expense_period: 'variable' }); }}><X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" /></button>
                    </div>
                    <form onSubmit={handleLogExpense} className="space-y-3">
                        <input type="text" name="name" placeholder="Expense description" className="w-full h-11 bg-secondary/30 border border-border rounded-xl px-4 text-xs outline-none focus:border-primary font-bold" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" name="amount" placeholder="Amount ₹" className="h-11 bg-secondary/30 border border-border rounded-xl px-4 text-xs outline-none focus:border-primary font-black italic" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} required />
                            <select name="expense_period" className="h-11 bg-secondary/30 border border-border rounded-xl px-3 text-[10px] font-black uppercase outline-none focus:border-primary appearance-none" value={formData.expense_period} onChange={(e) => setFormData(prev => ({ ...prev, expense_period: e.target.value }))}>
                                <option value="variable">Variable</option>
                                <option value="fixed">Fixed</option>
                            </select>
                        </div>
                        <div className="relative">
                            {!isManualCategory ? (
                                <select name="category_type" className="w-full h-11 bg-secondary/30 border border-border rounded-xl px-4 text-[10px] font-black uppercase outline-none focus:border-primary appearance-none" value={formData.category_type} onChange={(e) => e.target.value === 'ADD_NEW' ? (setIsManualCategory(true), setFormData(prev => ({ ...prev, category_type: '' }))) : setFormData(prev => ({ ...prev, category_type: e.target.value }))} required>
                                    <option value="" disabled>Select Category</option>
                                    {categories.map((cat, idx) => (<option key={idx} value={cat}>{cat}</option>))}
                                    <option value="ADD_NEW" className="text-primary font-black">+ Add New</option>
                                </select>
                            ) : (
                                <input type="text" name="category_type" placeholder="New category..." className="w-full h-11 bg-secondary/30 border border-border rounded-xl px-4 text-xs outline-none focus:border-primary font-bold" value={formData.category_type} onChange={(e) => setFormData(prev => ({ ...prev, category_type: e.target.value }))} required autoFocus />
                            )}
                        </div>
                        <div className="flex gap-2 pt-1">
                            {formData.uuid && <button type="button" onClick={() => { deleteMutation.mutateAsync(formData.uuid); setIsAddFormOpen(false); setFormData({ uuid: null, name: '', category_type: '', amount: '', expense_period: 'variable' }); }} className="h-10 px-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-3 h-3" /> Delete</button>}
                            <button type="submit" disabled={logMutation.isPending} className="flex-1 h-10 bg-primary text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 disabled:opacity-50">
                                {logMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                {formData.uuid ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-card border border-border rounded-3xl">
                <div className="p-4 border-b border-border bg-secondary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Daily Ledger</h3>
                    </div>
                </div>
                <div className="p-3 space-y-2">
                    {expenseData?.daily_logs?.length > 0 ? expenseData.daily_logs.map((item) => (
                        <div key={item.uuid} onClick={() => { setFormData({ uuid: item.uuid, name: item.name, category_type: item.category?.category_type || '', amount: item.amount, expense_period: item.category?.expense_period || 'variable' }); setIsAddFormOpen(true); }} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/30 hover:bg-primary/[0.02] cursor-pointer transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><ShoppingCart className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[11px] font-black text-foreground uppercase italic">{item.name}</p>
                                    <span className="text-[7px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">{item.category?.category_type || 'General'}</span>
                                </div>
                            </div>
                            <p className="text-[14px] font-black text-foreground italic">₹{item.amount.toLocaleString()}</p>
                        </div>
                    )) : (
                        <div className="py-8 text-center">
                            <Wallet className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">No expenses for this date</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Track;
