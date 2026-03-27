import React, { useState } from 'react';
import { Target, CalendarRange, Calendar as CalendarIcon, History, ShoppingCart, Plus, Loader2, Zap, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useBudgetPlansQuery, useCreateBudgetPlanMutation, useUpdateBudgetPlanMutation, useDeleteBudgetPlanMutation, useActivateBudgetPlanMutation } from '../http/queries';

const Manage = () => {
    const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
    const [editingBudgetPlan, setEditingBudgetPlan] = useState(null);
    const [budgetFormData, setBudgetFormData] = useState({
        name: '', amount: '', start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], is_active: false
    });

    const { data: budgetPlansData } = useBudgetPlansQuery();
    const createBudgetMutation = useCreateBudgetPlanMutation();
    const updateBudgetMutation = useUpdateBudgetPlanMutation();
    const deleteBudgetMutation = useDeleteBudgetPlanMutation();
    const activateBudgetMutation = useActivateBudgetPlanMutation();

    const budgetPlans = budgetPlansData?.data || [];
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...budgetFormData, amount: parseFloat(budgetFormData.amount) };
        editingBudgetPlan 
            ? await updateBudgetMutation.mutateAsync({ uuid: editingBudgetPlan.uuid, data: payload })
            : await createBudgetMutation.mutateAsync(payload);
        setIsBudgetFormOpen(false);
        setEditingBudgetPlan(null);
    };

    const handleEditBudget = (plan) => {
        setEditingBudgetPlan(plan);
        setBudgetFormData({
            name: plan.name, amount: plan.meta_data?.amount || '',
            start_date: plan.start_date, end_date: plan.end_date, is_active: plan.is_active
        });
        setIsBudgetFormOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl">
                <div className="p-4 border-b border-border bg-secondary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Budget Plan</h3>
                    </div>
                    <button onClick={() => setIsBudgetFormOpen(true)} className="h-8 px-3 bg-primary text-white rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        <Plus className="w-3 h-3" /> Add
                    </button>
                </div>

                {isBudgetFormOpen && (
                    <div className="p-4 border-b border-border bg-primary/[0.02]">
                        <form onSubmit={handleBudgetSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" name="name" placeholder="Plan Name" className="h-10 bg-secondary/30 border border-border rounded-xl px-3 text-[10px] font-bold outline-none focus:border-primary" value={budgetFormData.name} onChange={(e) => setBudgetFormData(prev => ({ ...prev, name: e.target.value }))} required />
                                <input type="number" name="amount" placeholder="Budget ₹" className="h-10 bg-secondary/30 border border-border rounded-xl px-3 text-[10px] font-black italic outline-none focus:border-primary" value={budgetFormData.amount} onChange={(e) => setBudgetFormData(prev => ({ ...prev, amount: e.target.value }))} required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="date" name="start_date" className="h-10 bg-secondary/30 border border-border rounded-xl px-3 text-[10px] font-bold outline-none focus:border-primary" value={budgetFormData.start_date} onChange={(e) => setBudgetFormData(prev => ({ ...prev, start_date: e.target.value }))} required />
                                <input type="date" name="end_date" className="h-10 bg-secondary/30 border border-border rounded-xl px-3 text-[10px] font-bold outline-none focus:border-primary" value={budgetFormData.end_date} onChange={(e) => setBudgetFormData(prev => ({ ...prev, end_date: e.target.value }))} required />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setIsBudgetFormOpen(false); setEditingBudgetPlan(null); }} className="h-9 px-4 bg-secondary/50 text-muted-foreground rounded-xl font-black text-[9px] uppercase tracking-widest hover:text-foreground transition-all">Cancel</button>
                                <button type="submit" disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending} className="flex-1 h-9 bg-primary text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 disabled:opacity-50">
                                    {createBudgetMutation.isPending || updateBudgetMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                    {editingBudgetPlan ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="p-3 space-y-2">
                    {budgetPlans.length > 0 ? budgetPlans.map((plan) => (
                        <div key={plan.uuid} className={cn("p-3 rounded-2xl border transition-all", plan.is_active ? "bg-primary/5 border-primary/30" : "bg-secondary/20 border-transparent hover:border-border")}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-[11px] font-black text-foreground uppercase italic truncate">{plan.name}</h4>
                                        {plan.is_active && <span className="text-[6px] font-black uppercase bg-primary text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0"><Zap className="w-2 h-2" /> Active</span>}
                                    </div>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                        <CalendarRange className="w-3 h-3" />
                                        {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                                    </p>
                                </div>
                                <p className="text-[16px] font-black text-primary italic shrink-0 ml-2">₹{(plan.meta_data?.amount || 0).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-1.5">
                                {!plan.is_active && (
                                    <button onClick={() => activateBudgetMutation.mutateAsync(plan.uuid)} disabled={activateBudgetMutation.isPending} className="flex-1 h-7 bg-primary/10 text-primary border border-primary/20 rounded-lg font-black text-[7px] uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-primary hover:text-white transition-all disabled:opacity-50">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Activate
                                    </button>
                                )}
                                <button onClick={() => handleEditBudget(plan)} className="h-7 px-3 bg-secondary/50 text-muted-foreground rounded-lg font-black text-[7px] uppercase tracking-widest flex items-center justify-center gap-1 hover:text-foreground transition-all">
                                    <Edit2 className="w-2.5 h-2.5" /> Edit
                                </button>
                                <button onClick={() => window.confirm("Delete?") && deleteBudgetMutation.mutateAsync(plan.uuid)} disabled={deleteBudgetMutation.isPending} className="h-7 px-2 bg-red-500/10 text-red-500 rounded-lg font-black text-[7px] uppercase tracking-widest flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                                    <Trash2 className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="py-8 text-center">
                            <Target className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">No budget plans</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Manage;
