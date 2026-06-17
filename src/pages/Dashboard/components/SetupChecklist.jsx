import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useChecklistQuery } from '../http/queries';

const SetupChecklist = () => {
    const navigate = useNavigate();
    const { data, refetch, isRefetching } = useChecklistQuery();
    const checklist = data?.data;

    const steps = checklist?.steps || [];
    const total = checklist?.total_steps || 0;
    const completed = checklist?.completed_steps || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-[13px] font-black tracking-tight text-foreground">Get Started</p>
                        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                            {completed} of {total} steps done
                        </p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", isRefetching && "animate-spin")} />
                    </button>
                </div>
                <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-700 ease-out",
                            percentage === 100 ? "bg-green-500" : "bg-primary"
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            <div className="divide-y divide-border/40">
                {steps.map((step) => (
                    <div
                        key={step.key}
                        className="flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors"
                    >
                        <div className="min-w-0">
                            <p className={cn(
                                "text-[12px] font-bold truncate",
                                step.enabled ? "text-muted-foreground" : "text-foreground"
                            )}>
                                {step.label}
                            </p>
                            {!step.enabled && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">{step.description}</p>
                            )}
                        </div>
                        {step.enabled ? (
                            <div className="shrink-0 ml-4 w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-500" />
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate(step.url)}
                                className="shrink-0 ml-4 h-8 px-3.5 rounded-lg border border-border text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-secondary/50 transition-all active:scale-[0.97]"
                            >
                                Set up
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SetupChecklist;
