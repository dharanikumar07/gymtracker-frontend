import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Home, BarChart3, Dumbbell, Wallet, Settings, CreditCard,
    ChevronDown, ChevronLeft, LogOut, Menu
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import ThemeToggle from './ThemeToggle';

import Dashboard from '../pages/Dashboard/index.jsx';
import Analytics from '../pages/Analytics/index.jsx';
import TrackProgress from '../pages/TrackProgress/index.jsx';
import TrackExpense from '../pages/TrackExpense/index.jsx';
import SettingsPage from '../pages/Settings/index.jsx';
import Billing from '../pages/Billing/index.jsx';

const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard', component: Dashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', component: Analytics },
    { id: 'progress', label: 'Progress', icon: Dumbbell, path: '/track-progress', component: TrackProgress },
    { id: 'expenses', label: 'Expenses', icon: Wallet, path: '/track-expense', component: TrackExpense },
    { id: 'billing', label: 'Billing', icon: CreditCard, path: '/billing', component: Billing },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', component: SettingsPage },
];

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const activeItem = menuItems.find(item => location.pathname === item.path) || menuItems[0];
    const ActiveComponent = activeItem.component;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen bg-background flex transition-colors duration-500 font-sans text-foreground overflow-hidden">
            
            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 relative shrink-0 h-screen sticky top-0",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={cn(
                        "absolute -right-3 top-20 z-50 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm",
                        !isSidebarOpen && "rotate-180"
                    )}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="h-full flex flex-col">
                    <div className="p-6 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                            <Dumbbell className="w-4 h-4 text-white" />
                        </div>
                        {isSidebarOpen && (
                            <span className="text-lg font-black tracking-tighter uppercase italic truncate text-foreground">GymOS</span>
                        )}
                    </div>

                    <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto no-scrollbar">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                                        isActive 
                                            ? "bg-primary/10 text-primary shadow-sm" 
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "group-hover:scale-110 transition-transform")} />
                                    {isSidebarOpen && <span className="text-sm font-bold truncate">{item.label}</span>}
                                    {isActive && isSidebarOpen && (
                                        <div className="absolute right-2 w-1 h-4 bg-primary rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border px-4 h-16 flex items-center justify-between pb-safe overflow-x-auto no-scrollbar gap-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center transition-all min-w-[50px] p-2 rounded-2xl",
                                isActive ? "text-primary scale-110" : "text-muted-foreground"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive && "fill-primary/10")} />
                            <div className={cn(
                                "w-1 h-1 rounded-full mt-1 transition-all",
                                isActive ? "bg-primary scale-100" : "bg-transparent scale-0"
                            )} />
                        </button>
                    );
                })}
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen lg:overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-40">
                    <div className="flex items-center gap-4 text-foreground">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                            {activeItem.label}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-secondary transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                    <span className="text-[10px] font-black text-primary group-hover:text-white uppercase">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs font-black leading-none text-foreground">{user?.name}</p>
                                </div>
                                <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-300", isProfileOpen && "rotate-180")} />
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 border-b border-border mb-1 bg-secondary/20">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Account</p>
                                            <p className="text-xs font-bold text-foreground truncate">{user?.email}</p>
                                        </div>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors text-left font-bold"
                                        >
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <ThemeToggle className="rounded-xl border-none bg-transparent hover:bg-secondary" />
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto bg-background/50 pb-20 lg:pb-6">
                    <div className="max-w-[1600px] mx-auto h-full">
                        <ActiveComponent />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
