import React from 'react';
import { CreditCard, Check, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';

const plans = [
    { id: 'free', name: 'Free', price: 0, features: ['Basic tracking', 'Limited analytics', 'Community support'] },
    { id: 'pro', name: 'Pro', price: 499, features: ['Unlimited tracking', 'Advanced analytics', 'Priority support', 'AI recommendations', 'Export data'] },
    { id: 'enterprise', name: 'Enterprise', price: 999, features: ['Everything in Pro', 'Team management', 'API access', 'Custom integrations', 'Dedicated support'] },
];

const Billing = () => {
    return (
        <div className="h-full flex flex-col p-4 font-sans">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-[14px] font-black uppercase italic text-foreground">Billing</h1>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Manage your subscription</p>
                </div>
            </div>

            <div className="space-y-4">
                {plans.map((plan) => (
                    <div key={plan.id} className={cn(
                        "bg-card border rounded-3xl p-5 transition-all",
                        plan.id === 'pro' ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {plan.id === 'pro' && <Crown className="w-5 h-5 text-primary" />}
                                <h3 className="text-[14px] font-black uppercase italic text-foreground">{plan.name}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[18px] font-black italic text-foreground">₹{plan.price}</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">per month</p>
                            </div>
                        </div>
                        <div className="space-y-2 mb-4">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span className="text-[10px] font-bold text-muted-foreground">{feature}</span>
                                </div>
                            ))}
                        </div>
                        <button className={cn(
                            "w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                            plan.id === 'pro' 
                                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                : "bg-secondary/30 text-foreground hover:bg-secondary"
                        )}>
                            {plan.id === 'pro' ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Billing;
