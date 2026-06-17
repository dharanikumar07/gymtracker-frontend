import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../../../lib/utils';

const CHART_H = 160;
const PAD_T = 20;
const PAD_B = 8;
const PAD_X = 28;

const WeeklyChart = ({ data }) => {
    const chart = data || [];
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);
    const [animated, setAnimated] = useState(false);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            for (const e of entries) setWidth(e.contentRect.width);
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const maxVal = Math.max(...chart.map(d => Math.max(d.workouts, d.expenses)), 1);
    const totalW = chart.reduce((s, d) => s + d.workouts, 0);
    const totalE = chart.reduce((s, d) => s + d.expenses, 0);
    const todayStr = new Date().toISOString().split('T')[0];

    const yOf = useCallback(v => {
        const usable = CHART_H - PAD_T - PAD_B;
        return PAD_T + usable - (v / maxVal) * usable;
    }, [maxVal]);

    const xOf = useCallback((i) => {
        if (chart.length <= 1) return width / 2;
        return PAD_X + (i / (chart.length - 1)) * (width - PAD_X * 2);
    }, [chart.length, width]);

    const linePath = useCallback((key) => {
        if (chart.length === 0 || width === 0) return '';
        const pts = chart.map((d, i) => ({ x: xOf(i), y: yOf(d[key]) }));
        let p = `M ${pts[0].x} ${pts[0].y}`;
        const tension = 0.3;
        for (let i = 1; i < pts.length; i++) {
            const dx = pts[i].x - pts[i - 1].x;
            const cp1x = pts[i - 1].x + dx * tension;
            const cp2x = pts[i].x - dx * tension;
            p += ` C ${cp1x} ${pts[i - 1].y}, ${cp2x} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
        }
        return p;
    }, [chart, xOf, yOf, width]);

    const handleMove = useCallback((e) => {
        if (!containerRef.current || chart.length === 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        let closest = 0;
        let minD = Infinity;
        chart.forEach((_, i) => {
            const d = Math.abs(x - xOf(i));
            if (d < minD) { minD = d; closest = i; }
        });
        setHovered(closest);
    }, [chart, xOf]);

    const handleLeave = useCallback(() => setHovered(null), []);

    const hoveredDay = hovered !== null ? chart[hovered] : null;
    const tooltipX = hovered !== null ? xOf(hovered) : 0;

    return (
        <div className="bg-card border border-border rounded-2xl p-4 pb-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-black tracking-tight text-foreground">Weekly Activity</p>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Workouts ({totalW})
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Expenses ({totalE})
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div ref={containerRef} className="relative">
                {width > 0 && (
                    <svg
                        width="100%"
                        height={CHART_H}
                        viewBox={`0 0 ${width} ${CHART_H}`}
                        className="overflow-visible"
                        onMouseMove={handleMove}
                        onMouseLeave={handleLeave}
                        onTouchMove={handleMove}
                        onTouchStart={handleMove}
                        onTouchEnd={handleLeave}
                    >
                        {/* Grid lines */}
                        {[0, 0.5, 1].map(r => (
                            <line
                                key={r}
                                x1={0} y1={yOf(r * maxVal)}
                                x2={width} y2={yOf(r * maxVal)}
                                className="stroke-border/20"
                                strokeWidth={1}
                            />
                        ))}

                        {/* Vertical hover line */}
                        {hovered !== null && (
                            <line
                                x1={tooltipX} y1={PAD_T}
                                x2={tooltipX} y2={CHART_H - PAD_B}
                                className="stroke-muted-foreground/30"
                                strokeWidth={1}
                            />
                        )}

                        {/* Workout line */}
                        <path
                            d={linePath('workouts')}
                            fill="none"
                            className="stroke-primary"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                strokeDasharray: animated ? '0' : '2000',
                                strokeDashoffset: animated ? '0' : '2000',
                                transition: 'stroke-dasharray 0.8s ease-out, stroke-dashoffset 0.8s ease-out',
                            }}
                        />

                        {/* Expense line */}
                        <path
                            d={linePath('expenses')}
                            fill="none"
                            className="stroke-emerald-500"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                strokeDasharray: animated ? '0' : '2000',
                                strokeDashoffset: animated ? '0' : '2000',
                                transition: 'stroke-dasharray 1s ease-out 0.15s, stroke-dashoffset 1s ease-out 0.15s',
                            }}
                        />

                        {/* Workout dots */}
                        {chart.map((day, i) => (
                            <circle
                                key={`w${i}`}
                                cx={xOf(i)} cy={yOf(day.workouts)}
                                r={hovered === i ? 3.5 : 2.5}
                                className="fill-primary"
                                style={{
                                    opacity: animated ? 1 : 0,
                                    transition: `opacity 0.2s ease-out ${0.6 + i * 0.04}s, r 0.15s ease-out`,
                                }}
                            />
                        ))}

                        {/* Expense dots */}
                        {chart.map((day, i) => (
                            <circle
                                key={`e${i}`}
                                cx={xOf(i)} cy={yOf(day.expenses)}
                                r={hovered === i ? 3.5 : 2.5}
                                className="fill-emerald-500"
                                style={{
                                    opacity: animated ? 1 : 0,
                                    transition: `opacity 0.2s ease-out ${0.7 + i * 0.04}s, r 0.15s ease-out`,
                                }}
                            />
                        ))}
                    </svg>
                )}

                {/* Inline tooltip */}
                {hoveredDay && width > 0 && (
                    <div
                        className="absolute pointer-events-none animate-in fade-in duration-100"
                        style={{
                            left: tooltipX,
                            top: PAD_T - 2,
                            transform: tooltipX > width / 2 ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)',
                        }}
                    >
                        <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 min-w-[120px]">
                            <p className="text-[10px] font-black text-foreground mb-1.5">{hoveredDay.day}</p>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-[10px] text-muted-foreground">Workouts</span>
                                    </div>
                                    <span className="text-[11px] font-black text-foreground">{hoveredDay.workouts}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] text-muted-foreground">Expenses</span>
                                    </div>
                                    <span className="text-[11px] font-black text-foreground">{hoveredDay.expenses}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Day labels */}
                {width > 0 && (
                    <div className="flex justify-between mt-2" style={{ paddingLeft: PAD_X, paddingRight: PAD_X }}>
                        {chart.map((day, i) => (
                            <span
                                key={i}
                                className={cn(
                                    "text-[9px] font-bold uppercase transition-colors",
                                    hovered === i
                                        ? "text-foreground"
                                        : day.date === todayStr
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                )}
                                style={{ width: 0, display: 'flex', justifyContent: 'center' }}
                            >
                                {day.day}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeeklyChart;
