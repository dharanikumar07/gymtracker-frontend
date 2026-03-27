import React from 'react';
import { 
    Wallet,
    Plus,
    ShoppingCart,
    Loader2,
    Save,
    CheckCircle2,
    ChevronDown,
    Trash2,
    X,
    Target,
    Clock,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Calendar,
    Flame,
    PiggyBank,
    Timer
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { 
    useLogExpenseMutation, 
    useDeleteExpenseMutation,
    useBudgetPlansQuery,
    useBudgetPlanStatusQuery
} from './http/expenseQueries';

const TrackExpenses = ({ expenseData, selectedDate, formatDate }) => {
    const [isAddFormOpen, setIsAddFormOpen] = React.useState(false);
    const [isManualCategory, setIsManualCategory] = React.useState(false);
    const [formData, setFormData] = React.useState({
        uuid: null,
        name: '',
        category_type: '',
        amount: '',
        expense_period: 'variable' 
    });

    const logMutation = useLogExpenseMutation();
    const deleteMutation = useDeleteExpenseMutation();
    const categories = expenseData?.all_categories || [];
    const summary = expenseData?.summary || { variable_spend: 0, fixed_commitment: 0, total_spend: 0 };
    
    const { data: budgetPlansData } = useBudgetPlansQuery();
    const activeBudget = budgetPlansData?.data?.find(plan => plan.is_active);
    const { data: budgetStatusData, isLoading: budgetLoading } = useBudgetPlanStatusQuery(activeBudget?.uuid);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        (name === 'category_type' && value === 'ADD_NEW') 
            ? (setIsManualCategory(true), setFormData(prev => ({ ...prev, category_type: '' })))
            : setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogExpense = async (e) => {
        e.preventDefault();
        formData.name && formData.category_type && formData.amount && await logMutation.mutateAsync({ ...formData, expense_date: selectedDate });
        setFormData({ uuid: null, name: '', category_type: '', amount: '', expense_period: 'variable' });
        setIsAddFormOpen(false);
        setIsManualCategory(false);
    };

    const handleEdit = (item) => {
        const catType = item.category?.category_type || '';
        setFormData({
            uuid: item.uuid,
            name: item.name,
            category_type: catType,
            amount: item.amount,
            expense_period: item.category?.expense_period || 'variable'
        });
        setIsManualCategory(!categories.includes(catType));
        setIsAddFormOpen(true);
    };

    const handleDelete = async (uuid) => {
        window.confirm("Delete this transaction permanently?") && await deleteMutation.mutateAsync(uuid);
        setFormData({ uuid: null, name: '', category_type: '', amount: '', expense_period: 'variable' });
        setIsAddFormOpen(false);
    };

    const statusColor = budgetStatusData?.data?.status?.color;
    const stats = budgetStatusData?.data?.stats;
    const plan = budgetStatusData?.data?.plan;

    const progressPercent = stats ? Math.min((stats.days_passed / stats.total_days) * 100, 100) : 0;
    const spentPercent = stats && stats.budget_amount > 0 ? Math.min((stats.total_spent / stats.budget_amount) * 100, 100) : 0;

    const statusConfig = {
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', icon: Clock, label: 'Upcoming' },
        green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500', icon: TrendingUp, label: 'On Track' },
        yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500', icon: AlertTriangle, label: 'Warning' },
        red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', icon: TrendingDown, label: 'Over Budget' },
    };

    const currentStatus = statusConfig[statusColor] || statusConfig.blue;
    const StatusIcon = currentStatus.icon;

    return (
        <div className="space-y-4">
            {/* Budget Tracking Card - Redesigned */}
            {activeBudget ? (
                <div className={cn("border rounded-3xl overflow-hidden", currentStatus.bg, currentStatus.border)}>
                    {/* Header */}
                    <div className="p-4 bg-background/50">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", currentStatus.bg)}>
                                    <Target className={cn("w-5 h-5", currentStatus.text)} />
                                </div>
                                <div>
                                    <h3 className="text-[12px] font-black text-foreground uppercase italic">{plan?.name}</h3>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {plan ? new Date(plan.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} - {plan ? new Date(plan.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                    </p>
                                </div>
                            </div>
                            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full", currentStatus.bg)}>
                                <StatusIcon className={cn("w-3.5 h-3.5", currentStatus.text)} />
                                <span className={cn("text-[9px] font-black uppercase tracking-wider", currentStatus.text)}>
                                    {budgetStatusData?.data?.status?.text}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar - Days */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                <span className="text-muted-foreground">Days Progress</span>
                                <span className={currentStatus.text}>{stats?.days_passed || 0}/{stats?.total_days || 0} Days</span>
                            </div>
                            <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full transition-all duration-500", 
                                        statusColor === 'blue' ? 'bg-blue-500' 
                                        : statusColor === 'green' ? 'bg-green-500' 
                                        : statusColor === 'yellow' ? 'bg-yellow-500' 
                                        : 'bg-red-500'
                                    )}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {budgetLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {/* Main Stats Row */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="bg-background/70 rounded-2xl p-3 text-center">
                                    <PiggyBank className="w-4 h-4 text-primary mx-auto mb-1" />
                                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Budget</p>
                                    <p className="text-[13px] font-black italic text-foreground">₹{stats?.budget_amount?.toLocaleString() || 0}</p>
                                </div>
                                <div className="bg-background/70 rounded-2xl p-3 text-center">
                                    <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Spent</p>
                                    <p className={cn("text-[13px] font-black italic", spentPercent > 100 ? 'text-red-500' : 'text-foreground')}>₹{stats?.total_spent?.toLocaleString() || 0}</p>
                                </div>
                                <div className="bg-background/70 rounded-2xl p-3 text-center">
                                    <Timer className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Remaining</p>
                                    <p className={cn("text-[13px] font-black italic", (stats?.remaining_amount || 0) < 0 ? 'text-red-500' : 'text-green-500')}>₹{Math.abs(stats?.remaining_amount || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-background/70 rounded-2xl p-3 text-center">
                                    <Calendar className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Days Left</p>
                                    <p className="text-[13px] font-black italic text-foreground">{stats?.remaining_days || 0}</p>
                                </div>
                            </div>

                            {/* Secondary Stats */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-secondary/30 rounded-xl p-2.5 text-center">
                                    <p className="text-[6px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Expected</p>
                                    <p className="text-[11px] font-bold italic text-foreground">₹{Math.round(stats?.expected_spent || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-secondary/30 rounded-xl p-2.5 text-center">
                                    <p className="text-[6px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Daily Allowance</p>
                                    <p className="text-[11px] font-bold italic text-primary">₹{Math.round(stats?.daily_allowance || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-secondary/30 rounded-xl p-2.5 text-center">
                                    <p className="text-[6px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">% Used</p>
                                    <p className={cn("text-[11px] font-bold italic", spentPercent > 100 ? 'text-red-500' : spentPercent > 80 ? 'text-yellow-500' : 'text-green-500')}>{Math.round(spentPercent)}%</p>
                                </div>
                            </div>

                            {/* Spent Progress Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground">Spending Progress</span>
                                    <span className={spentPercent > 100 ? 'text-red-500' : 'text-green-500'}>
                                        {spentPercent > 100 ? `${Math.round(spentPercent - 100)}% Over` : `${Math.round(100 - spentPercent)}% Left`}
                                    </span>
                                </div>
                                <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-500 relative", 
                                            spentPercent > 100 ? 'bg-red-500' 
                                            : spentPercent > 80 ? 'bg-yellow-500' 
                                            : 'bg-green-500'
                                        )}
                                        style={{ width: `${Math.min(spentPercent, 100)}%` }}
                                    />
                                    {spentPercent > 100 && (
                                        <div 
                                            className="absolute right-0 top-0 h-full bg-red-600/50 rounded-r-full animate-pulse"
                                            style={{ width: `${Math.min(spentPercent - 100, 100)}%` }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-card border border-border rounded-3xl p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                            <Target className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-[11px] font-black uppercase italic text-foreground mb-1">No Active Budget</h3>
                        <p className="text-[9px] font-bold text-muted-foreground italic">Create a budget plan in Manage to track spending</p>
                    </div>
                </div>
            )}

            {/* Three Summary Cards */}
            <div className="grid grid-cols-3 gap-2">
                {[{ label: 'Variable', val: summary.variable_spend }, { label: 'Fixed', val: summary.fixed_commitment }, { label: 'Total', val: summary.total_spend, dark: true }].map((s, i) => (
                    <div key={i} className={cn("border rounded-2xl p-3 flex flex-col justify-center min-h-[80px] shadow-sm", s.dark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-card border-border")}>
                        <p className={cn("text-[7px] font-black uppercase tracking-widest mb-1", s.dark ? "text-zinc-400" : "text-muted-foreground")}>{s.label}</p>
                        <h4 className="text-base sm:text-lg font-black italic">₹{s.val.toLocaleString()}</h4>
                    </div>
                ))}
            </div>

            {/* Add Expense Button / Form */}
            {!isAddFormOpen ? (
                <button 
                    onClick={() => setIsAddFormOpen(true)}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Expense
                </button>
            ) : (
                <div className="bg-card border border-border rounded-3xl p-4 shadow-sm animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 italic">
                            <Plus className="w-3.5 h-3.5" /> {formData.uuid ? 'Modify' : 'Add'} Expense
                        </h3>
                        <button onClick={() => { setIsAddFormOpen(false); setIsManualCategory(false); setFormData({ uuid: null, name: '', category_type: '', amount: '', expense_period: 'variable' }); }}>
                            <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                        </button>
                    </div>
                    <form onSubmit={handleLogExpense} className="space-y-3">
                        <input type="text" name="name" placeholder="Expense description" className="w-full h-11 bg-secondary/30 border border-border rounded-xl px-4 text-xs outline-none focus:border-primary font-bold" value={formData.name} onChange={handleInputChange} required />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" name="amount" placeholder="Amount ₹" className="h-11 bg-secondary/30 border border-border rounded-xl px-4 text-xs outline-none focus:border-primary font-black italic" value={formData.amount} onChange={handleInputChange} required />
                            <div className="relative">
                                <select name="expense_period" className="w-full h-11 bg-secondary/30 border border-border rounded-xl px-3 text-[10px] font-black uppercase outline-none focus:border-primary appearance-none pr-8" value={formData.expense_period} onChange={handleInputChange}>
                                    <option value="variable">Variable</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                        <div className="relative">
                            {!isManualCategory ? (
                                <select name="category_type" className="w-full h-11 bg-secondary/30 border border-border rounded-xl px-4 text-[10px] font-black uppercase outline-none focus:border-primary appearance-none pr-8" value={formData.category_type} onChange={handleInputChange} required>
                                    <option value="" disabled>Select Category</option>
                                    {categories.map((cat, idx) => (<option key={idx} value={cat}>{cat}</option>))}
                                    <option value="ADD_NEW" className="text-primary font-black">+ Add New</option>
                                </select>
                            ) : (
                                <input type="text" name="category_type" placeholder="New category..." className="w-full h-11 bg-secondary/30 border border-border rounded-xl px-4 text-xs outline-none focus:border-primary font-bold" value={formData.category_type} onChange={handleInputChange} required autoFocus />
                            )}
                        </div>
                        <div className="flex gap-2 pt-1">
                            {formData.uuid && (
                                <button type="button" onClick={() => handleDelete(formData.uuid)} className="h-10 px-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            )}
                            <button type="submit" disabled={logMutation.isPending} className="flex-1 h-10 bg-primary text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 disabled:opacity-50">
                                {logMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                {formData.uuid ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Daily Ledger */}
            <div className="bg-card border border-border rounded-3xl">
                <div className="p-4 border-b border-border bg-secondary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Daily Ledger</h3>
                    </div>
                    <span className="text-[8px] font-black text-muted-foreground italic">{formatDate(selectedDate)}</span>
                </div>
                <div className="p-3 space-y-2">
                    {expenseData?.daily_logs?.length > 0 ? expenseData.daily_logs.map((item) => (
                        <div key={item.uuid} onClick={() => handleEdit(item)} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/30 hover:bg-primary/[0.02] cursor-pointer transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <ShoppingCart className="w-4 h-4" />
                                </div>
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

export default TrackExpenses;