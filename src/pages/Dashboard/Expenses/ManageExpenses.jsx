import React from 'react';
import { 
    Target,
    CalendarRange,
    Calendar as CalendarIcon,
    History,
    ShoppingCart,
    Plus,
    Loader2,
    Zap,
    CheckCircle2,
    Edit2,
    Trash2,
    X
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { 
    useBudgetPlansQuery,
    useCreateBudgetPlanMutation,
    useUpdateBudgetPlanMutation,
    useDeleteBudgetPlanMutation,
    useActivateBudgetPlanMutation
} from './http/expenseQueries';

const ManageExpenses = ({ expenseData }) => {
    const [isBudgetFormOpen, setIsBudgetFormOpen] = React.useState(false);
    const [editingBudgetPlan, setEditingBudgetPlan] = React.useState(null);
    const [budgetFormData, setBudgetFormData] = React.useState({
        name: '',
        amount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        is_active: false
    });

    const [recentActivityDateRange, setRecentActivityDateRange] = React.useState('this_month');
    const [startDate, setStartDate] = React.useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [isStartPickerOpen, setIsStartPickerOpen] = React.useState(false);
    const [isEndPickerOpen, setIsEndPickerOpen] = React.useState(false);

    const { data: budgetPlansData } = useBudgetPlansQuery();
    const createBudgetMutation = useCreateBudgetPlanMutation();
    const updateBudgetMutation = useUpdateBudgetPlanMutation();
    const deleteBudgetMutation = useDeleteBudgetPlanMutation();
    const activateBudgetMutation = useActivateBudgetPlanMutation();

    const budgetPlans = budgetPlansData?.data || [];
    const dateRangeOptions = [
        { id: 'today', label: 'Today' },
        { id: 'this_week', label: 'This Week' },
        { id: 'this_month', label: 'This Month' },
        { id: 'custom', label: 'Custom' },
    ];

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatShortDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const handleBudgetInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBudgetFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...budgetFormData, amount: parseFloat(budgetFormData.amount) };
        editingBudgetPlan 
            ? await updateBudgetMutation.mutateAsync({ uuid: editingBudgetPlan.uuid, data: payload })
            : await createBudgetMutation.mutateAsync(payload);
        resetBudgetForm();
    };

    const handleEditBudget = (plan) => {
        setEditingBudgetPlan(plan);
        setBudgetFormData({
            name: plan.name,
            amount: plan.meta_data?.amount || '',
            start_date: plan.start_date,
            end_date: plan.end_date,
            is_active: plan.is_active
        });
        setIsBudgetFormOpen(true);
    };

    const handleDeleteBudget = async (uuid) => {
        window.confirm("Delete this budget plan?") && await deleteBudgetMutation.mutateAsync(uuid);
    };

    const handleActivateBudget = async (uuid) => {
        await activateBudgetMutation.mutateAsync(uuid);
    };

    const resetBudgetForm = () => {
        setEditingBudgetPlan(null);
        setBudgetFormData({
            name: '',
            amount: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            is_active: false
        });
        setIsBudgetFormOpen(false);
    };

    const handleDateRangeChange = (rangeId) => {
        setRecentActivityDateRange(rangeId);
        const today = new Date();
        switch (rangeId) {
            case 'today':
                setStartDate(today.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
                break;
            case 'this_week':
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                setStartDate(new Date(today.setDate(diff)).toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
                break;
            case 'this_month':
                setStartDate(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
                break;
        }
    };

    return (
        <div className="space-y-4">
            {/* Budget Plan Section */}
            <div className="bg-card border border-border rounded-3xl">
                <div className="p-4 border-b border-border bg-secondary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Budget Plan</h3>
                    </div>
                    <button onClick={() => setIsBudgetFormOpen(true)} className="h-8 px-3 bg-primary text-white rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        <Plus className="w-3 h-3" />
                        Add
                    </button>
                </div>

                {isBudgetFormOpen && (
                    <div className="p-4 border-b border-border bg-primary/[0.02]">
                        <form onSubmit={handleBudgetSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" name="name" placeholder="Plan Name" className="h-10 bg-secondary/30 border border-border rounded-xl px-3 text-[10px] font-bold outline-none focus:border-primary" value={budgetFormData.name} onChange={handleBudgetInputChange} required />
                                <input type="number" name="amount" placeholder="Budget ₹" className="h-10 bg-secondary/30 border border-border rounded-xl px-3 text-[10px] font-black italic outline-none focus:border-primary" value={budgetFormData.amount} onChange={handleBudgetInputChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="date" name="start_date" className="h-10 bg-secondary/30 border border-border rounded-xl px-3 text-[10px] font-bold outline-none focus:border-primary" value={budgetFormData.start_date} onChange={handleBudgetInputChange} required />
                                <input type="date" name="end_date" className="h-10 bg-secondary/30 border border-border rounded-xl px-3 text-[10px] font-bold outline-none focus:border-primary" value={budgetFormData.end_date} onChange={handleBudgetInputChange} required />
                            </div>
                            <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-xl">
                                <span className="text-[9px] font-black text-foreground uppercase italic">Set as Active</span>
                                <button type="button" onClick={() => setBudgetFormData(prev => ({ ...prev, is_active: !prev.is_active }))} className={cn("w-10 h-5 rounded-full transition-all relative", budgetFormData.is_active ? "bg-primary" : "bg-border")}>
                                    <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-all", budgetFormData.is_active ? "right-0.5" : "left-0.5")} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={resetBudgetForm} className="h-9 px-4 bg-secondary/50 text-muted-foreground rounded-xl font-black text-[9px] uppercase tracking-widest hover:text-foreground transition-all">Cancel</button>
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
                                    <button onClick={() => handleActivateBudget(plan.uuid)} disabled={activateBudgetMutation.isPending} className="flex-1 h-7 bg-primary/10 text-primary border border-primary/20 rounded-lg font-black text-[7px] uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-primary hover:text-white transition-all disabled:opacity-50">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Activate
                                    </button>
                                )}
                                <button onClick={() => handleEditBudget(plan)} className="h-7 px-3 bg-secondary/50 text-muted-foreground rounded-lg font-black text-[7px] uppercase tracking-widest flex items-center justify-center gap-1 hover:text-foreground transition-all">
                                    <Edit2 className="w-2.5 h-2.5" /> Edit
                                </button>
                                <button onClick={() => handleDeleteBudget(plan.uuid)} disabled={deleteBudgetMutation.isPending} className="h-7 px-2 bg-red-500/10 text-red-500 rounded-lg font-black text-[7px] uppercase tracking-widest flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
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

            {/* Fixed Obligations Section */}
            <div className="bg-card border border-border rounded-3xl">
                <div className="p-4 border-b border-border bg-secondary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Fixed Obligations</h3>
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground italic">
                        ₹{expenseData?.fixed_expenses?.reduce((sum, f) => sum + (f.default_amount || 0), 0)?.toLocaleString() || 0}
                    </span>
                </div>
                <div className="p-3 space-y-1.5">
                    {expenseData?.fixed_expenses?.length > 0 ? expenseData.fixed_expenses.map((fixed, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-secondary/20 border border-transparent hover:border-border transition-all">
                            <p className="text-[11px] font-black text-foreground uppercase">{fixed.category_type}</p>
                            <span className="text-[11px] font-black italic">₹{fixed.default_amount?.toLocaleString()}</span>
                        </div>
                    )) : (
                        <div className="py-6 text-center">
                            <CalendarIcon className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">No fixed expenses</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-card border border-border rounded-3xl">
                <div className="p-4 border-b border-border bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Recent Activity</h3>
                    </div>
                    <div className="flex p-0.5 bg-secondary/50 rounded-lg">
                        {dateRangeOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleDateRangeChange(option.id)}
                                className={cn(
                                    "px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-wider transition-all",
                                    recentActivityDateRange === option.id 
                                        ? "bg-primary text-white" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                    {expenseData?.filtered_logs?.length > 0 ? expenseData.filtered_logs.map((item) => (
                        <div key={item.uuid} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/20 border border-transparent hover:border-border transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ShoppingCart className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-foreground uppercase italic">{item.name}</p>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{item.category?.category_type} • {formatShortDate(item.expense_date)}</p>
                                </div>
                            </div>
                            <p className="text-[14px] font-black text-foreground italic">₹{item.amount.toLocaleString()}</p>
                        </div>
                    )) : (
                        <div className="py-8 text-center">
                            <History className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">No activity found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageExpenses;