import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Trash2, 
    ArrowRight, 
    ArrowLeft, 
    Dumbbell,
    Check,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import ThemeToggle from '../components/ThemeToggle';
import { cn } from '../lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [activeDay, setActiveDay] = useState('Monday');

    const [basicInfo, setBasicInfo] = useState({ age: '', height: '', weight: '', fitness_goal: 'muscle_gain' });
    const [weeklySplit, setWeeklySplit] = useState(
        FULL_DAYS.reduce((acc, day) => ({ ...acc, [day]: ['', '', '', '', ''] }), {})
    );

    const handleAddSlot = (day) => {
        setWeeklySplit(prev => ({ ...prev, [day]: [...prev[day], ''] }));
    };

    const handleRemoveSlot = (day, index) => {
        if (weeklySplit[day].length <= 1) return;
        setWeeklySplit(prev => ({ ...prev, [day]: prev[day].filter((_, i) => i !== index) }));
    };

    const handleWorkoutChange = (day, index, value) => {
        const updatedDay = [...weeklySplit[day]];
        updatedDay[index] = value;
        setWeeklySplit(prev => ({ ...prev, [day]: updatedDay }));
    };

    const handleFinish = async (isSkipping = false) => {
        setLoading(true);
        try {
            if (!isSkipping) {
                const data = step === 1 ? basicInfo : { weekly_split: weeklySplit };
                await api.post('/onboarding/step', { step, data });
            }
            if (step === 1) {
                setStep(2);
                window.scrollTo(0, 0);
            } else {
                toast.success('Ready to work!');
                navigate('/dashboard');
            }
        } catch (err) {
            toast.error('Sync failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 flex items-center justify-center p-6 transition-colors duration-500">
            <ThemeToggle />
            
            <div className="w-full max-w-[440px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                
                {/* Compact Progress Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Step {step}/2</span>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                            {step === 1 ? 'Personal Profile' : 'Workout Routine'}
                        </h1>
                    </div>
                    <button onClick={() => handleFinish(true)} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 uppercase transition-colors">Skip</button>
                </div>

                <div className="px-8 py-6">
                    {/* Step 1: Compact Essentials */}
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 ml-0.5">Age</label>
                                    <input 
                                        type="number" 
                                        placeholder="24"
                                        className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-primary outline-none font-semibold text-sm transition-all"
                                        value={basicInfo.age}
                                        onChange={(e) => setBasicInfo({...basicInfo, age: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 ml-0.5">Height (cm)</label>
                                    <input 
                                        type="number" 
                                        placeholder="175"
                                        className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-primary outline-none font-semibold text-sm transition-all"
                                        value={basicInfo.height}
                                        onChange={(e) => setBasicInfo({...basicInfo, height: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 ml-0.5">Weight (kg)</label>
                                    <input 
                                        type="number" 
                                        placeholder="70.5"
                                        className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-primary outline-none font-semibold text-sm transition-all"
                                        value={basicInfo.weight}
                                        onChange={(e) => setBasicInfo({...basicInfo, weight: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 ml-0.5">Fitness Goal</label>
                                    <select 
                                        className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-primary outline-none font-semibold text-sm appearance-none cursor-pointer transition-all"
                                        value={basicInfo.fitness_goal}
                                        onChange={(e) => setBasicInfo({...basicInfo, fitness_goal: e.target.value})}
                                    >
                                        <option value="muscle_gain">Gain Muscle</option>
                                        <option value="weight_loss">Lose Weight</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Neat Routine UI */
                        <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                            {/* Mini Day Tabs */}
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg overflow-x-auto no-scrollbar">
                                {DAYS.map((day, i) => (
                                    <button
                                        key={day}
                                        onClick={() => setActiveDay(FULL_DAYS[i])}
                                        className={cn(
                                            "flex-1 py-1.5 px-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap",
                                            activeDay === FULL_DAYS[i] ? "bg-white dark:bg-zinc-700 text-primary shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                        )}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                {weeklySplit[activeDay].map((workout, index) => (
                                    <div key={index} className="flex items-center gap-2 group animate-in slide-in-from-bottom-1 duration-200" style={{animationDelay: `${index * 30}ms`}}>
                                        <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-[10px] font-bold text-zinc-400 flex-none">{index+1}</div>
                                        <input 
                                            type="text"
                                            placeholder="Exercise..."
                                            className="flex-1 h-8 px-3 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded focus:ring-1 focus:ring-primary outline-none text-xs font-medium transition-all"
                                            value={workout}
                                            onChange={(e) => handleWorkoutChange(activeDay, index, e.target.value)}
                                        />
                                        <button onClick={() => handleRemoveSlot(activeDay, index)} className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => handleAddSlot(activeDay)}
                                    className="w-full py-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="h-3 w-3" /> Add Exercise
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Fixed Footer Buttons */}
                <div className="px-8 pb-8 flex gap-3">
                    {step === 2 && (
                        <button onClick={() => setStep(1)} className="h-10 w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-800">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    )}
                    <button 
                        onClick={() => handleFinish()}
                        disabled={loading}
                        className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            <>
                                {step === 1 ? "Next Step" : "Get Started"}
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
