import React, { useState, useMemo, useEffect } from 'react';
import { 
    IndianRupee, 
    Calendar as CalendarIcon, 
    History, 
    BarChart3, 
    Loader2, 
    ChevronDown, 
    Check, 
    Trophy, 
    Target, 
    Activity, 
    CalendarDays, 
    TrendingUp, 
    Clock, 
    PieChart as PieChartIcon, 
    Wallet, 
    TrendingDown, 
    CreditCard,
    Layers
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Legend, 
    Cell, 
    Area, 
    AreaChart,
    Sector
} from 'recharts';
import { cn } from '../../../lib/utils';
import { useAnalytics } from '../context/AnalyticsContext';
import { 
    useAnalyticsOverviewQuery, 
    useExpenseLogQuery, 
    useExpenseInsightsQuery, 
    useExpenseTrendQuery, 
    useExpenseDistributionQuery, 
    useAvailableExpenseCategoriesQuery 
} from '../http/queries';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/popover';
import { StatCard } from '../components/AnalyticsStats';
import CategoryCombobox from '../components/CategoryCombobox';

const rangeOptions = [
    { id: 'date', label: 'Single Day' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' }
];

const typeOptions = [
    { id: 'day', label: 'Daily' },
    { id: 'week', label: 'Weekly' },
    { id: 'month', label: 'Monthly' }
];

const periodOptions = {
    day: [
        { id: '10', label: 'Last 10 Days' },
        { id: '20', label: 'Last 20 Days' },
        { id: '30', label: 'Last 30 Days' },
        { id: '40', label: 'Last 40 Days' },
        { id: 'all_time', label: 'All Time' }
    ],
    week: [
        { id: '4', label: 'Last 4 Weeks' },
        { id: '8', label: 'Last 8 Weeks' },
        { id: '12', label: 'Last 12 Weeks' },
        { id: 'this_year', label: 'All Weeks This Year' },
        { id: 'all_time', label: 'All Time' }
    ],
    month: [
        { id: '4', label: 'Last 4 Months' },
        { id: '8', label: 'Last 8 Months' },
        { id: 'this_year', label: 'This Year' },
        { id: 'all_time', label: 'All Time' }
    ]
};

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#71717a'];

const LogItem = ({ log }) => (
    <div className="flex flex-col p-4 bg-card/50 border border-border/40 rounded-2xl hover:border-primary/30 transition-all group">
        <div className="flex items-center gap-4">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                "bg-emerald-500/10"
            )}>
                <IndianRupee className={cn(
                    "w-5 h-5 transition-colors text-emerald-500"
                )} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-[11px] font-black uppercase tracking-tight text-foreground truncate">
                        {log.category_name}
                    </h4>
                    <span className="text-[10px] font-black text-foreground">
                        ₹{log.amount.toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500"
                    )}>
                        {log.type}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">
                        {format(parseISO(log.expense_date), 'dd MMM')}
                    </span>
                </div>
            </div>
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, colorClass = "bg-primary/10 text-primary" }) => (
    <div className="flex items-center gap-3 mb-6 lg:mb-0 lg:mr-auto">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground truncate">{title}</h3>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest italic truncate">{subtitle}</p>
        </div>
    </div>
);

const CustomDistributionTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[140px]">
                <p className="text-[10px] font-black uppercase text-white mb-1 tracking-wider">{data.name}</p>
                <div className="space-y-1">
                    <p className="text-xl font-black text-emerald-500 leading-none">
                        {data.value}<span className="text-[10px] ml-0.5 opacity-70">%</span>
                    </p>
                    <div className="pt-1.5 border-t border-white/5">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Total Amount</p>
                        <p className="text-[11px] font-black text-white">₹{data.raw_amount?.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const ExpenseAnalytics = () => {
    const { selectedDate, setSelectedDate, formattedDate } = useAnalytics();
    const [viewMode, setViewMode] = useState('log');
    const [filterMode, setFilterMode] = useState('date');
    const [isRangeOpen, setIsRangeOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    
    // Trend State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [trendType, setTrendType] = useState('month'); 
    const [trendLookback, setTrendLookback] = useState('4');

    // Distribution State
    const [distType, setDistType] = useState('month');
    const [distLookback, setDistLookback] = useState('4');
    const [activeIndex, setActiveIndex] = useState(0);

    const { data: overviewData } = useAnalyticsOverviewQuery(formattedDate);
    const planDetails = overviewData?.data?.expense?.plan_details;

    const dateRange = useMemo(() => {
        if (filterMode === 'week') {
            return {
                startDate: format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                endDate: format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
            };
        }
        if (filterMode === 'month') {
            return {
                startDate: format(startOfMonth(selectedDate), 'yyyy-MM-dd'),
                endDate: format(endOfMonth(selectedDate), 'yyyy-MM-dd')
            };
        }
        return { startDate: format(selectedDate, 'yyyy-MM-dd'), endDate: null };
    }, [filterMode, selectedDate]);

    // Queries
    const { data: logsData, isLoading: logsLoading } = useExpenseLogQuery({ ...dateRange, enabled: viewMode === 'log' });
    const { data: insightsData, isLoading: insightsLoading } = useExpenseInsightsQuery({ ...dateRange, enabled: viewMode === 'analytics' });
    const { data: categoriesData } = useAvailableExpenseCategoriesQuery();
    
    const { data: trendData, isLoading: trendLoading } = useExpenseTrendQuery({
        periodType: trendType,
        lookback: trendLookback,
        categoryUuid: selectedCategory?.uuid,
        enabled: viewMode === 'analytics'
    });

    const { data: distData, isLoading: distLoading } = useExpenseDistributionQuery({
        periodType: distType,
        lookback: distLookback,
        enabled: viewMode === 'analytics'
    });

    const isLoading = viewMode === 'log' ? logsLoading : (insightsLoading || trendLoading || distLoading);
    const selectedRangeLabel = rangeOptions.find(opt => opt.id === filterMode)?.label;

    const chartData = trendData?.data || [];
    const distributionData = distData?.data?.data || [];
    const currentDistLabel = distData?.data?.label || 'Current Period';
    const currentDistTotal = distData?.data?.total_amount || 0;

    // Dynamic Period Reset for Trend
    useEffect(() => {
        setTrendLookback(trendType === 'day' ? '10' : '4');
    }, [trendType]);

    // Dynamic Period Reset for Distribution
    useEffect(() => {
        setDistLookback(distType === 'day' ? '10' : '4');
    }, [distType]);

    const scrollableChartWidth = useMemo(() => {
        const pointsCount = chartData.length;
        if (pointsCount <= 6) return '100%';
        const minPointWidth = 80; 
        return `${pointsCount * minPointWidth}px`;
    }, [chartData]);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    return (
        <div className="space-y-4 max-w-[1400px] mx-auto overflow-x-hidden px-1 pb-10 text-foreground">
            {/* Header Section */}
            <div className="bg-card border border-border/40 rounded-[2rem] p-3 shadow-sm relative group">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    {planDetails?.cycle_period ? `${planDetails.cycle_period} Cycle` : 'Expense Tracker'}
                                </span>
                            </div>
                            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-foreground truncate max-w-[200px] sm:max-w-none">
                                {planDetails?.name || 'Spending Analysis'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Popover open={isRangeOpen} onOpenChange={setIsRangeOpen}>
                                <PopoverTrigger asChild>
                                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-none">
                                        <span className="truncate">{selectedRangeLabel}</span>
                                        <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-[160px] p-1.5 rounded-2xl">
                                    {rangeOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setFilterMode(opt.id);
                                                setIsRangeOpen(false);
                                            }}
                                            className={cn(
                                                "flex items-center justify-between w-full px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors",
                                                filterMode === opt.id ? "bg-emerald-500/10 text-emerald-500" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                            )}
                                        >
                                            {opt.label}
                                            {filterMode === opt.id && <Check className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </PopoverContent>
                            </Popover>

                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-8 px-4 rounded-xl border border-border/40 bg-background text-foreground hover:bg-secondary/40 transition-all shadow-sm">
                                        <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <span className="text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                                            {format(selectedDate, 'dd MMM')}
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="p-0 border-none bg-transparent shadow-none">
                                    <div className="bg-card border-2 border-border rounded-[2rem] shadow-2xl overflow-hidden">
                                        <Calendar 
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setSelectedDate(date);
                                                    setIsCalendarOpen(false);
                                                }
                                            }}
                                            className="p-3"
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="hidden md:block w-px h-6 bg-border/40 mx-1" />

                        <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/30 w-full sm:w-auto">
                            {[
                                { id: 'log', icon: History, label: 'Log' },
                                { id: 'analytics', icon: BarChart3, label: 'Insights' }
                            ].map((mode) => (
                                <button 
                                    key={mode.id}
                                    onClick={() => setViewMode(mode.id)}
                                    className={cn(
                                        "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 h-7 rounded-[10px] text-[8px] font-black uppercase tracking-widest transition-all",
                                        viewMode === mode.id 
                                            ? "bg-card text-foreground shadow-sm border border-border/20" 
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <mode.icon className="w-3 h-3" />
                                    <span>{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-6">
                        {viewMode === 'log' ? (
                            <div className="space-y-8">
                                {/* Fixed Expenses Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="h-px flex-1 bg-border/40" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 whitespace-nowrap">
                                            Fixed Expenses
                                        </span>
                                        <div className="h-px flex-1 bg-border/40" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {logsData?.data?.fixed?.length > 0 ? (
                                            logsData.data.fixed.map((log) => (
                                                <LogItem key={log.uuid} log={log} />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-6 text-center opacity-30 text-[9px] font-black uppercase tracking-widest italic">
                                                No fixed expenses recorded
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Variable Expenses Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="h-px flex-1 bg-border/40" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 whitespace-nowrap">
                                            Variable Expenses
                                        </span>
                                        <div className="h-px flex-1 bg-border/40" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {logsData?.data?.variable?.length > 0 ? (
                                            logsData.data.variable.map((log) => (
                                                <LogItem key={log.uuid} log={log} />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-6 text-center opacity-30 text-[9px] font-black uppercase tracking-widest italic">
                                                No variable expenses found for this period
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Insights Summary Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <StatCard icon={IndianRupee} label="Total Spent" value={`₹${insightsData?.data?.summary?.total_spent?.toLocaleString() || 0}`} subValue="Total volume" colorClass="bg-emerald-500/10 text-emerald-500" />
                                    <StatCard icon={TrendingDown} label="Daily Average" value={`₹${insightsData?.data?.summary?.avg_per_day?.toLocaleString() || 0}`} subValue="Spent per day" colorClass="bg-amber-500/10 text-amber-500" />
                                    <StatCard icon={Trophy} label="Highest Category" value={insightsData?.data?.summary?.highest_category || 'N/A'} subValue="Most expensive" colorClass="bg-emerald-500/10 text-emerald-500" />
                                    <StatCard icon={CreditCard} label="Transactions" value={insightsData?.data?.summary?.transaction_count || 0} subValue="Total logs" colorClass="bg-primary/10 text-primary" />
                                </div>

                                {/* Spending Trend Section */}
                                <div className="bg-card border border-border/40 rounded-[2.5rem] p-4 sm:p-8 shadow-sm flex flex-col overflow-hidden">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-6 sm:mb-10">
                                        <SectionHeader 
                                            icon={TrendingUp} 
                                            title="Spending Trend" 
                                            subtitle={selectedCategory ? `Spending on ${selectedCategory.name}` : "Track your expenditure over time"}
                                            colorClass="bg-emerald-500/10 text-emerald-500"
                                        />

                                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                            <div className="flex items-center gap-2 w-full lg:w-auto">
                                                <div className="flex-1 lg:w-[120px]">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="flex items-center justify-between w-full h-8 px-3 rounded-xl bg-secondary/30 border border-border/30 text-[9px] font-black uppercase tracking-widest hover:bg-secondary/50 transition-all group">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Layers className="w-3 h-3 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
                                                                    <span>{typeOptions.find(t => t.id === trendType)?.label}</span>
                                                                </div>
                                                                <ChevronDown className="w-3 h-3 opacity-30" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent align="start" className="w-[140px] p-1.5 rounded-2xl">
                                                            {typeOptions.map((t) => (
                                                                <button
                                                                    key={t.id}
                                                                    onClick={() => setTrendType(t.id)}
                                                                    className={cn(
                                                                        "flex items-center justify-between w-full px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors",
                                                                        trendType === t.id ? "bg-emerald-500/10 text-emerald-500" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                                                    )}
                                                                >
                                                                    {t.label}
                                                                    {trendType === t.id && <Check className="w-3 h-3" />}
                                                                </button>
                                                            ))}
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                <div className="flex-1 lg:w-[160px]">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="flex items-center justify-between w-full h-8 px-3 rounded-xl bg-background border border-border/40 text-[9px] font-black uppercase tracking-widest hover:bg-secondary/40 transition-all">
                                                                <div className="flex items-center gap-1.5 truncate">
                                                                    <Clock className="w-3 h-3 text-emerald-500" />
                                                                    <span className="truncate">{periodOptions[trendType].find(p => p.id === trendLookback)?.label || 'Period'}</span>
                                                                </div>
                                                                <ChevronDown className="w-3 h-3 opacity-50" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent align="end" className="w-[180px] p-1.5 rounded-2xl">
                                                            {periodOptions[trendType].map((p) => (
                                                                <button
                                                                    key={p.id}
                                                                    onClick={() => setTrendLookback(p.id)}
                                                                    className={cn(
                                                                        "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                                                        trendLookback === p.id ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                                                    )}
                                                                >
                                                                    {p.label}
                                                                    {trendLookback === p.id && <Check className="w-3 h-3" />}
                                                                </button>
                                                            ))}
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>

                                            <div className="w-full lg:w-auto">
                                                <CategoryCombobox 
                                                    categories={categoriesData?.data}
                                                    selectedCategory={selectedCategory}
                                                    onSelect={setSelectedCategory}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full overflow-x-auto scrollbar-none pb-2">
                                        <div style={{ width: scrollableChartWidth }} className="h-[300px] sm:h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                                                    <defs>
                                                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                                    <XAxis 
                                                        dataKey="label" 
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#64748b', fontSize: 8, fontWeight: 'bold' }}
                                                    />
                                                    <YAxis 
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#64748b', fontSize: 8, fontWeight: 'bold' }}
                                                        tickFormatter={(val) => `₹${val}`}
                                                    />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '12px' }}
                                                        labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', marginBottom: '4px' }}
                                                        itemStyle={{ color: '#10b981', fontSize: '14px', fontWeight: 'black' }}
                                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="amount" 
                                                        stroke="#10b981" 
                                                        strokeWidth={4}
                                                        fillOpacity={1} 
                                                        fill="url(#expenseGradient)" 
                                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Distribution Section (Pie Chart) */}
                                <div className="bg-card border border-border/40 rounded-[2.5rem] p-4 sm:p-8 shadow-sm flex flex-col overflow-hidden">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-6 sm:mb-10">
                                        <SectionHeader 
                                            icon={PieChartIcon} 
                                            title="Category Distribution" 
                                            subtitle={`Spending share for ${currentDistLabel}`}
                                            colorClass="bg-emerald-500/10 text-emerald-500"
                                        />

                                        <div className="flex items-center gap-2 w-full lg:w-auto">
                                            <div className="flex-1 lg:w-[120px]">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className="flex items-center justify-between w-full h-8 px-3 rounded-xl bg-secondary/30 border border-border/30 text-[9px] font-black uppercase tracking-widest hover:bg-secondary/50 transition-all group">
                                                            <div className="flex items-center gap-1.5">
                                                                <Layers className="w-3 h-3 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
                                                                <span>{typeOptions.find(t => t.id === distType)?.label}</span>
                                                            </div>
                                                            <ChevronDown className="w-3 h-3 opacity-30" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="start" className="w-[140px] p-1.5 rounded-2xl">
                                                        {typeOptions.map((t) => (
                                                            <button
                                                                key={t.id}
                                                                onClick={() => setDistType(t.id)}
                                                                className={cn(
                                                                    "flex items-center justify-between w-full px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors",
                                                                    distType === t.id ? "bg-emerald-500/10 text-emerald-500" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                                                )}
                                                            >
                                                                {t.label}
                                                                {distType === t.id && <Check className="w-3 h-3" />}
                                                            </button>
                                                        ))}
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div className="flex-1 lg:w-[160px]">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className="flex items-center justify-between w-full h-8 px-3 rounded-xl bg-background border border-border/40 text-[9px] font-black uppercase tracking-widest hover:bg-secondary/40 transition-all">
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <Clock className="w-3 h-3 text-emerald-500" />
                                                                <span className="truncate">{periodOptions[distType].find(p => p.id === distLookback)?.label || 'Period'}</span>
                                                            </div>
                                                            <ChevronDown className="w-3 h-3 opacity-50" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="end" className="w-[180px] p-1.5 rounded-2xl">
                                                        {periodOptions[distType].map((p) => (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => setDistLookback(p.id)}
                                                                className={cn(
                                                                    "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                                                    distLookback === p.id ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                                                )}
                                                            >
                                                                {p.label}
                                                                {distLookback === p.id && <Check className="w-3 h-3" />}
                                                            </button>
                                                        ))}
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative w-full h-[350px] sm:h-[400px] flex items-center justify-center overflow-hidden">
                                        {distributionData.length > 0 ? (
                                            <>
                                                {/* Center Label for Donut */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-10 sm:mb-0">
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1 opacity-40">Period Total</p>
                                                    <p className="text-2xl sm:text-3xl font-black text-foreground">₹{currentDistTotal.toLocaleString()}</p>
                                                </div>

                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={distributionData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius="60%"
                                                            outerRadius="85%"
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            animationDuration={1000}
                                                            onMouseEnter={onPieEnter}
                                                            stroke="transparent"
                                                        >
                                                            {distributionData.map((entry, index) => (
                                                                <Cell 
                                                                    key={`cell-${index}`} 
                                                                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                                                    className="outline-none hover:opacity-80 transition-opacity"
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip content={<CustomDistributionTooltip />} />
                                                        <Legend 
                                                            verticalAlign="bottom" 
                                                            height={60}
                                                            formatter={(value) => <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{value}</span>}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center opacity-20 text-center animate-in fade-in zoom-in duration-500">
                                                <PieChartIcon className="w-12 h-12 mb-3 text-emerald-500" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Expense Logs Found</p>
                                                <p className="text-[8px] font-bold uppercase tracking-widest mt-1">Try changing the period</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseAnalytics;
