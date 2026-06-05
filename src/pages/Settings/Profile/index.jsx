import React, { useState, useEffect } from 'react';
import { 
    User, 
    Mail, 
    Calendar, 
    UserCircle, 
    Ruler, 
    Weight, 
    Target, 
    Activity, 
    Save, 
    Loader2,
    ChevronDown,
    Zap,
    Wind,
    ShieldCheck,
    ChartNoAxesCombined,
    Dumbbell,
    Check
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useProfileQuery, useUpdateProfileMutation } from '../http/queries';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';

const GENDER_OPTIONS = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'other', label: 'Other' },
];

const FITNESS_GOALS = [
    { id: 'weight_loss', label: 'Weight Loss', icon: Activity },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: Target },
    { id: 'maintenance', label: 'Maintenance', icon: User },
];

const ACTIVITY_TYPES = [
    { id: 'strength_training', label: 'Strength', icon: Dumbbell },
    { id: 'cardio_training', label: 'Cardio', icon: Zap },
    { id: 'flexibility_yoga', label: 'Yoga', icon: Wind },
    { id: 'balance_core', label: 'Balanced', icon: ChartNoAxesCombined },
    { id: 'calisthenics', label: 'Calisthenics', icon: ShieldCheck },
];

const InputField = ({ icon: Icon, label, value, onChange, type = "text", placeholder, disabled }) => (
    <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            {label}
        </label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full h-10 pl-10 pr-4 bg-secondary/5 border border-border/40 rounded-xl text-[12px] font-bold text-foreground outline-none focus:border-primary/50 focus:bg-background transition-all"
            />
        </div>
    </div>
);

const SelectPill = ({ label, value, onChange, options, disabled }) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            {label}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {options.map((opt) => {
                const Icon = opt.icon;
                const isActive = value === opt.id;
                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        disabled={disabled}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all group",
                            isActive 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border/40 bg-secondary/5 hover:border-border hover:bg-secondary/20"
                        )}
                    >
                        <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            isActive ? "bg-primary text-white" : "bg-secondary/50 text-muted-foreground/40"
                        )}>
                            <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-tight truncate",
                            isActive ? "text-primary" : "text-foreground"
                        )}>
                            {opt.label}
                        </span>
                    </button>
                );
            })}
        </div>
    </div>
);

const SaveButton = ({ onSave, isSaving }) => (
    <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center justify-center gap-1.5 h-8 px-4 rounded-lg bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 active:scale-95 group"
    >
        {isSaving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
            <Save className="w-3 h-3" />
        )}
        <span>{isSaving ? 'Saving' : 'Save'}</span>
    </button>
);

const Profile = () => {
    const { data: profileData, isLoading } = useProfileQuery();
    const updateProfileMutation = useUpdateProfileMutation();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        fitness_data: {
            age: '',
            gender: 'male',
            height: '',
            weight: '',
            fitness_goal: 'maintenance',
            physical_activity_type: 'strength_training'
        }
    });

    useEffect(() => {
        if (profileData?.data) {
            setFormData({
                name: profileData.data.name || '',
                email: profileData.data.email || '',
                fitness_data: {
                    age: profileData.data.fitness_data?.age || '',
                    gender: profileData.data.fitness_data?.gender || 'male',
                    height: profileData.data.fitness_data?.height || '',
                    weight: profileData.data.fitness_data?.weight || '',
                    fitness_goal: profileData.data.fitness_data?.fitness_goal || 'maintenance',
                    physical_activity_type: profileData.data.fitness_data?.physical_activity_type || 'strength_training'
                }
            });
        }
    }, [profileData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFitnessChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            fitness_data: {
                ...prev.fitness_data,
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        updateProfileMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Profile...</p>
            </div>
        );
    }

    const isSaving = updateProfileMutation.isPending;

    return (
        <div className="w-full px-4 sm:px-[10%] pb-10">
            <div className="max-w-4xl mx-auto space-y-5">
                {/* Basic Info */}
                <div className="bg-card border border-border/60 rounded-[1.5rem] p-5 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                            <UserCircle className="w-5 h-5 text-primary" />
                            <h3 className="text-[12px] font-black uppercase tracking-tight text-foreground">Account</h3>
                        </div>
                        <SaveButton onSave={handleSave} isSaving={isSaving} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField 
                            icon={User} 
                            label="Name" 
                            value={formData.name} 
                            onChange={(val) => handleInputChange('name', val)} 
                            placeholder="John Doe"
                            disabled={isSaving}
                        />
                        <InputField 
                            icon={Mail} 
                            label="Email" 
                            value={formData.email} 
                            onChange={(val) => handleInputChange('email', val)} 
                            placeholder="john@example.com"
                            type="email"
                            disabled={isSaving}
                        />
                    </div>
                </div>

                {/* Fitness Data */}
                <div className="bg-card border border-border/60 rounded-[1.5rem] p-5 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 border-b border-border/40 pb-3">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <h3 className="text-[12px] font-black uppercase tracking-tight text-foreground">Physical Stats</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField 
                                icon={Calendar} 
                                label="Age" 
                                value={formData.fitness_data.age} 
                                onChange={(val) => handleFitnessChange('age', val)} 
                                placeholder="25"
                                type="number"
                                disabled={isSaving}
                            />
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gender</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button 
                                            disabled={isSaving}
                                            className="w-full h-10 px-3 bg-secondary/5 border border-border/40 rounded-xl flex items-center justify-between text-[12px] font-bold text-foreground hover:border-primary/50 transition-all outline-none"
                                        >
                                            <span className="capitalize">{formData.fitness_data.gender}</span>
                                            <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="w-[120px] p-1">
                                        <div className="flex flex-col gap-0.5">
                                            {GENDER_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleFitnessChange('gender', opt.id)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-bold hover:bg-secondary transition-colors",
                                                        formData.fitness_data.gender === opt.id ? "text-primary bg-primary/5" : "text-foreground"
                                                    )}
                                                >
                                                    {opt.label}
                                                    {formData.fitness_data.gender === opt.id && <Check className="w-3 h-3" />}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <InputField 
                                icon={Ruler} 
                                label="Height (cm)" 
                                value={formData.fitness_data.height} 
                                onChange={(val) => handleFitnessChange('height', val)} 
                                placeholder="175"
                                type="number"
                                disabled={isSaving}
                            />
                            <InputField 
                                icon={Weight} 
                                label="Weight (kg)" 
                                value={formData.fitness_data.weight} 
                                onChange={(val) => handleFitnessChange('weight', val)} 
                                placeholder="70"
                                type="number"
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-card border border-border/60 rounded-[1.5rem] p-5 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 border-b border-border/40 pb-3">
                        <Target className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-[12px] font-black uppercase tracking-tight text-foreground">Goals & Training</h3>
                    </div>

                    <div className="space-y-6">
                        <SelectPill 
                            label="Fitness Goal" 
                            value={formData.fitness_data.fitness_goal} 
                            onChange={(val) => handleFitnessChange('fitness_goal', val)} 
                            options={FITNESS_GOALS}
                            disabled={isSaving}
                        />
                        <SelectPill 
                            label="Training Style" 
                            value={formData.fitness_data.physical_activity_type} 
                            onChange={(val) => handleFitnessChange('physical_activity_type', val)} 
                            options={ACTIVITY_TYPES}
                            disabled={isSaving}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
