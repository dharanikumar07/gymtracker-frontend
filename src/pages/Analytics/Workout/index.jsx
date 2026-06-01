import React, { useState, useMemo, useEffect } from 'react';
import { 
    Dumbbell, 
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
    PieChart as PieChartIcon
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Legend,
    Cell
} from 'recharts';
import { cn } from '../../../lib/utils';
import { useAnalytics } from '../context/AnalyticsContext';
import { 
    useAnalyticsOverviewQuery, 
    useWorkoutLogQuery, 
    useWorkoutInsightsQuery,
    useAvailableExercisesQuery,
    useProgressiveOverloadQuery,
    useMuscleDistributionQuery
} from '../http/queries';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/popover';
import { StatCard } from '../components/AnalyticsStats';
import ExerciseCombobox from '../components/ExerciseCombobox';

const rangeOptions = [
    { id: 'date', label: 'Single Day' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' }
];

const periodOptions = {
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

const MetricsDisplay = ({ type, data }) => {
    if (!data) return null;

    if (type === 'strength') {
        const sets = Array.isArray(data.sets) ? data.sets : [];
        return (
            <div className="mt-3 flex flex-wrap gap-1.5">
                {sets.map((set, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                        <span className="text-[8px] font-black text-emerald-500/50">#{i + 1}</span>
                        <span className="text-[9px] font-black text-foreground">{set.weight || 0}kg</span>
                        <span className="text-[8px] font-bold text-muted-foreground">×</span>
                        <span className="text-[9px] font-black text-primary">{set.reps || 0}</span>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'timed_sets') {
        const sets = Array.isArray(data.sets) ? data.sets : [];
        return (
            <div className="mt-3 flex flex-wrap gap-1.5">
                {sets.map((set, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                        <span className="text-[8px] font-black text-blue-500/50">#{i + 1}</span>
                        <span className="text-[9px] font-black text-foreground">{set.duration || data.duration || 0}s</span>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'endurance') {
        return (
            <div className="mt-2 flex items-center gap-2">
                <div className="px-3 py-1 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                        {data.duration || 0} {data.duration_unit || 'mins'}
                    </span>
                </div>
            </div>
        );
    }

    return null;
};

const LogItem = ({ log }) => (
    <div className="flex flex-col p-4 bg-card/50 border border-border/40 rounded-2xl hover:border-primary/30 transition-all group">
        <div className="flex items-center gap-4">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                log.status === 'completed' ? "bg-emerald-500/10" : "bg-secondary/50"
            )}>
                <Activity className={cn(
                    "w-5 h-5 transition-colors",
                    log.status === 'completed' ? "text-emerald-500" : "text-muted-foreground"
                )} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-[11px] font-black uppercase tracking-tight text-foreground truncate">
                        {log.workout_name}
                    </h4>
                    <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                        log.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-secondary/50 text-muted-foreground"
                    )}>
                        {log.status}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                        {log.metrics_type?.replace('_', ' ')}
                    </span>
                </div>
            </div>
        </div>

        {log.status === 'completed' && (
            <MetricsDisplay type={log.metrics_type} data={log.metrics_data} />
        )}
    </div>
);

const DateGroup = ({ date, workouts }) => (
    <div className="space-y-3">
        <div className="flex items-center gap-3 px-2">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
                {format(parseISO(date), 'EEEE, dd MMMM')}
            </span>
            <div className="h-px flex-1 bg-border/40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workouts.map((workout, idx) => (
                <LogItem key={`${date}-${idx}`} log={workout} />
            ))}
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, colorClass = "bg-primary/10 text-primary" }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", colorClass)}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground truncate">{title}</h3>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest italic truncate">{subtitle}</p>
        </div>
    </div>
);

const Workout = () => {
    const { selectedDate, setSelectedDate, formattedDate } = useAnalytics();
    const [viewMode, setViewMode] = useState('log');
    const [filterMode, setFilterMode] = useState('date');
    const [isRangeOpen, setIsRangeOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    
    // Progressive Overload State
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [overloadType, setOverloadType] = useState('month');
    const [lookbackPeriod, setLookbackPeriod] = useState('4');

    // Muscle Distribution State
    const [muscleOverloadType, setMuscleOverloadType] = useState('month');
    const [muscleLookbackPeriod, setMuscleLookbackPeriod] = useState('4');

    const { data: overviewData } = useAnalyticsOverviewQuery(formattedDate);
    const planDetails = overviewData?.data?.workout?.plan_details;

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

    // Data Fetching
    const { data: logsData, isLoading: logsLoading } = useWorkoutLogQuery({ ...dateRange, enabled: viewMode === 'log' });
    const { data: insightsData, isLoading: insightsLoading } = useWorkoutInsightsQuery({ ...dateRange, enabled: viewMode === 'analytics' });
    const { data: exercisesData } = useAvailableExercisesQuery();
    
    useEffect(() => {
        if (exercisesData?.data && exercisesData.data.length > 0 && !selectedExercise) {
            setSelectedExercise(exercisesData.data[0]);
        }
    }, [exercisesData, selectedExercise]);

    // Dynamic Period Reset for Progressive Overload
    useEffect(() => {
        setLookbackPeriod('4');
    }, [overloadType]);

    // Dynamic Period Reset for Muscle Distribution
    useEffect(() => {
        setMuscleLookbackPeriod('4');
    }, [muscleOverloadType]);

    const { data: overloadData, isLoading: overloadLoading } = useProgressiveOverloadQuery({
        exerciseUuid: selectedExercise?.uuid,
        periodType: overloadType,
        lookback: lookbackPeriod,
        enabled: viewMode === 'analytics'
    });

    const { data: muscleData, isLoading: muscleLoading } = useMuscleDistributionQuery({
        periodType: muscleOverloadType,
        lookback: muscleLookbackPeriod,
        enabled: viewMode === 'analytics'
    });

    const isLoading = viewMode === 'log' ? logsLoading : (insightsLoading || overloadLoading || muscleLoading);
    const selectedRangeLabel = rangeOptions.find(opt => opt.id === filterMode)?.label;

    const chartData = overloadData?.data || [];
    
    // For Pie Chart, use the latest period's distribution data
    const muscleDistributionData = useMemo(() => {
        const rawData = muscleData?.data || [];
        if (rawData.length === 0) return [];
        return rawData[rawData.length - 1]?.data || [];
    }, [muscleData]);

    const currentMuscleLabel = useMemo(() => {
        const rawData = muscleData?.data || [];
        return rawData[rawData.length - 1]?.label || 'Current Period';
    }, [muscleData]);

    // Calculate dynamic chart width for scrolling ONLY when data is dense
    const scrollableChartWidth = useMemo(() => {
        const pointsCount = chartData.length;
        if (pointsCount <= 6) return '100%'; // No scroll for small datasets
        
        const minPointWidth = 80; 
        return `${pointsCount * minPointWidth}px`;
    }, [chartData]);

    return (
        <div className="space-y-4 max-w-[1400px] mx-auto overflow-x-hidden px-1 pb-10 text-foreground">
            {/* Header Section */}
            <div className="bg-card border border-border/40 rounded-[2rem] p-3 shadow-sm relative group">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                            <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    {planDetails?.pa_type || 'Strength Training'}
                                </span>
                            </div>
                            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-foreground truncate max-w-[200px] sm:max-w-none">
                                {planDetails?.name || 'My Transformation Plan'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 md:gap-3">
                        <Popover open={isRangeOpen} onOpenChange={setIsRangeOpen}>
                            <PopoverTrigger asChild>
                                <button className="flex items-center gap-2 h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-none">
                                    {selectedRangeLabel}
                                    <ChevronDown className="w-3.5 h-3.5" />
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
                                <button className="flex items-center gap-2 h-8 px-4 rounded-xl border border-border/40 bg-background text-foreground hover:bg-secondary/40 transition-all shadow-sm">
                                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
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

                        <div className="hidden md:block w-px h-6 bg-border/40 mx-1" />

                        <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/30 ml-auto md:ml-0">
                            {[
                                { id: 'log', icon: History, label: 'Log' },
                                { id: 'analytics', icon: BarChart3, label: 'Insights' }
                            ].map((mode) => (
                                <button 
                                    key={mode.id}
                                    onClick={() => setViewMode(mode.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 sm:px-4 h-7 rounded-[10px] text-[8px] font-black uppercase tracking-widest transition-all",
                                        viewMode === mode.id 
                                            ? "bg-card text-foreground shadow-sm border border-border/20" 
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <mode.icon className="w-3 h-3" />
                                    <span className="hidden sm:inline">{mode.label}</span>
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
                                {logsData?.data && Object.keys(logsData.data).length > 0 ? (
                                    Object.entries(logsData.data).map(([date, workouts]) => (
                                        <DateGroup key={date} date={date} workouts={workouts} />
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-secondary/10 rounded-[2rem] border border-dashed border-border">
                                        <History className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">No logs found for this period</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Insights Summary Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <StatCard icon={Target} label="Total Sessions" value={insightsData?.data?.summary?.total_sessions || 0} subValue="Planned workouts" colorClass="bg-blue-500/10 text-blue-500" />
                                    <StatCard icon={CalendarDays} label="Active Days" value={insightsData?.data?.summary?.active_days || 0} subValue="Days in gym" colorClass="bg-amber-500/10 text-amber-500" />
                                    <StatCard icon={Trophy} label="Personal Best" value={`${insightsData?.data?.summary?.personal_best?.weight || 0}kg`} subValue={insightsData?.data?.summary?.personal_best?.exercise || 'No data'} colorClass="bg-emerald-500/10 text-emerald-500" />
                                    <StatCard icon={TrendingUp} label="Consistency" value={`${insightsData?.data?.summary?.completion_rate || 0}%`} subValue="Adherence score" colorClass="bg-primary/10 text-primary" />
                                </div>

                                {/* Main Progressive Overload Section */}
                                <div className="bg-card border border-border/40 rounded-[2.5rem] p-4 sm:p-8 shadow-sm flex flex-col overflow-hidden">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 sm:mb-10">
                                        <SectionHeader 
                                            icon={TrendingUp} 
                                            title="Progressive Overload" 
                                            subtitle="Track your weight volume growth"
                                            colorClass="bg-emerald-500/10 text-emerald-500"
                                        />

                                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                            <div className="flex items-center gap-2 w-full lg:w-auto">
                                                <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/30 shrink-0">
                                                    {['week', 'month'].map((t) => (
                                                        <button 
                                                            key={t}
                                                            onClick={() => setOverloadType(t)}
                                                            className={cn(
                                                                "px-3 sm:px-4 h-7 rounded-[10px] text-[8px] font-black uppercase tracking-widest transition-all",
                                                                overloadType === t ? "bg-card text-foreground shadow-sm border border-border/20" : "text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex-1 lg:w-[160px]">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="flex items-center justify-between w-full h-8 px-3 rounded-xl bg-background border border-border/40 text-[9px] font-black uppercase tracking-widest hover:bg-secondary/40 transition-all">
                                                                <div className="flex items-center gap-1.5 truncate">
                                                                    <Clock className="w-3 h-3 text-blue-500" />
                                                                    <span className="truncate">{periodOptions[overloadType].find(p => p.id === lookbackPeriod)?.label || 'Period'}</span>
                                                                </div>
                                                                <ChevronDown className="w-3 h-3 opacity-50" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent align="end" className="w-[180px] p-1.5 rounded-2xl">
                                                            {periodOptions[overloadType].map((p) => (
                                                                <button
                                                                    key={p.id}
                                                                    onClick={() => setLookbackPeriod(p.id)}
                                                                    className={cn(
                                                                        "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                                                        lookbackPeriod === p.id ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                                                    )}
                                                                >
                                                                    {p.label}
                                                                    {lookbackPeriod === p.id && <Check className="w-3 h-3" />}
                                                                </button>
                                                            ))}
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>

                                            <div className="w-full lg:w-auto">
                                                <ExerciseCombobox 
                                                    exercises={exercisesData?.data}
                                                    selectedExercise={selectedExercise}
                                                    onSelect={setSelectedExercise}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progressive Overload Chart - Scrollable Wrapper */}
                                    <div className="w-full overflow-x-auto scrollbar-none pb-2">
                                        <div style={{ width: scrollableChartWidth }} className="h-[300px] sm:h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
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
                                                        tickFormatter={(val) => `${val}kg`}
                                                    />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '12px' }}
                                                        labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', marginBottom: '4px' }}
                                                        itemStyle={{ color: '#10b981', fontSize: '14px', fontWeight: 'black' }}
                                                        formatter={(value) => [`${value.toLocaleString()} kg`, 'Volume']}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="volume" 
                                                        stroke="#10b981" 
                                                        strokeWidth={4}
                                                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Muscle Group Distribution Section (Pie Chart) */}
                                <div className="bg-card border border-border/40 rounded-[2.5rem] p-4 sm:p-8 shadow-sm flex flex-col overflow-hidden">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-10">
                                        <SectionHeader 
                                            icon={PieChartIcon} 
                                            title="Muscle Distribution" 
                                            subtitle={`Volume for ${currentMuscleLabel}`}
                                            colorClass="bg-blue-500/10 text-blue-500"
                                        />

                                        <div className="flex items-center gap-2 w-full lg:w-auto">
                                            <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/30 shrink-0">
                                                {['week', 'month'].map((t) => (
                                                    <button 
                                                        key={t}
                                                        onClick={() => setMuscleOverloadType(t)}
                                                        className={cn(
                                                            "px-3 sm:px-4 h-7 rounded-[10px] text-[8px] font-black uppercase tracking-widest transition-all",
                                                            muscleOverloadType === t ? "bg-card text-foreground shadow-sm border border-border/20" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex-1 lg:w-[160px]">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className="flex items-center justify-between w-full h-8 px-3 rounded-xl bg-background border border-border/40 text-[9px] font-black uppercase tracking-widest hover:bg-secondary/40 transition-all">
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <Clock className="w-3 h-3 text-blue-500" />
                                                                <span className="truncate">{periodOptions[muscleOverloadType].find(p => p.id === muscleLookbackPeriod)?.label || 'Period'}</span>
                                                            </div>
                                                            <ChevronDown className="w-3 h-3 opacity-50" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="end" className="w-[180px] p-1.5 rounded-2xl">
                                                        {periodOptions[muscleOverloadType].map((p) => (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => setMuscleLookbackPeriod(p.id)}
                                                                className={cn(
                                                                    "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                                                    muscleLookbackPeriod === p.id ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                                                )}
                                                            >
                                                                {p.label}
                                                                {muscleLookbackPeriod === p.id && <Check className="w-3 h-3" />}
                                                            </button>
                                                        ))}
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full h-[350px] sm:h-[400px] flex items-center justify-center overflow-hidden">
                                        {muscleDistributionData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={muscleDistributionData}
                                                        cx="50%"
                                                        cy="45%"
                                                        innerRadius="50%"
                                                        outerRadius="80%"
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        animationDuration={1000}
                                                    >
                                                        {muscleDistributionData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '12px' }}
                                                        itemStyle={{ fontSize: '12px', fontWeight: 'black' }}
                                                        formatter={(value) => [`${value}%`, 'Distribution']}
                                                    />
                                                    <Legend 
                                                        verticalAlign="bottom" 
                                                        height={60}
                                                        formatter={(value) => <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{value}</span>}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center opacity-20 text-center animate-in fade-in zoom-in duration-500">
                                                <PieChartIcon className="w-12 h-12 mb-3 text-blue-500" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Muscle Logs Found</p>
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

export default Workout;
