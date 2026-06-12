import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../lib/utils';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const ITEM_HEIGHT = 40;

function ScrollColumn({ items, selected, onSelect }) {
    const listRef = useRef(null);

    useEffect(() => {
        if (!listRef.current) return;
        const idx = items.indexOf(selected);
        if (idx >= 0) {
            listRef.current.scrollTop = idx * ITEM_HEIGHT;
        }
    }, [selected, items]);

    return (
        <div className="flex flex-col min-w-0 flex-1">
            <div className="h-10 flex items-center justify-center border border-primary/40 bg-primary/5 rounded-lg mx-0.5">
                <span className="text-sm font-black text-primary tabular-nums">{selected}</span>
            </div>
            <div
                ref={listRef}
                className="mt-1 overflow-y-auto scrollbar-none"
                style={{ maxHeight: ITEM_HEIGHT * 5.5 }}
            >
                {items.map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onSelect(item)}
                        className={cn(
                            "w-full flex items-center justify-center text-sm font-semibold tabular-nums transition-colors",
                            item === selected
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        style={{ height: ITEM_HEIGHT }}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function TimePicker({ value = '10:00', onChange, disabled }) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    const [h, m] = value.split(':');
    const [hour, setHour] = useState(h.padStart(2, '0'));
    const [minute, setMinute] = useState(m.padStart(2, '0'));

    useEffect(() => {
        const [h, m] = value.split(':');
        setHour(h.padStart(2, '0'));
        setMinute(m.padStart(2, '0'));
    }, [value]);

    const commit = useCallback((h, m) => {
        onChange?.(`${h}:${m}`);
    }, [onChange]);

    const handleHour = (h) => { setHour(h); commit(h, minute); };
    const handleMinute = (m) => { setMinute(m); commit(hour, m); };

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, [open]);

    const calcPosition = useCallback(() => {
        if (!triggerRef.current) return { top: 0, left: 0 };
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownW = 160;
        const dropdownH = 300;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let top = rect.bottom + 6;
        let left = rect.left;

        if (left + dropdownW > vw - 8) left = vw - dropdownW - 8;
        if (left < 8) left = 8;
        if (top + dropdownH > vh - 8) top = rect.top - dropdownH - 6;
        if (top < 8) top = 8;

        return { top, left };
    }, []);

    const [pos, setPos] = useState({ top: 0, left: 0 });

    useLayoutEffect(() => {
        if (open) setPos(calcPosition());
    }, [open, calcPosition]);

    const handleOpen = () => {
        if (disabled) return;
        if (!open) {
            setPos(calcPosition());
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    const displayTime = `${hour}:${minute}`;

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={handleOpen}
                className={cn(
                    "w-full flex items-center h-10 px-3 bg-secondary/5 border border-border/40 rounded-xl transition-all",
                    open && "border-primary/40",
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                )}
            >
                <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center mr-2.5 transition-all duration-300",
                    !disabled ? "bg-emerald-500/10 text-emerald-500" : "bg-secondary/40 text-muted-foreground/40"
                )}>
                    <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1 text-left text-[12px] font-black text-foreground tabular-nums uppercase">
                    {displayTime}
                </span>
            </button>

            {open && (
                <div
                    ref={dropdownRef}
                    className="fixed z-[9999] w-[160px] bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
                    style={{ top: pos.top, left: pos.left }}
                >
                    <div className="flex gap-0 p-2">
                        <ScrollColumn items={HOURS} selected={hour} onSelect={handleHour} />
                        <ScrollColumn items={MINUTES} selected={minute} onSelect={handleMinute} />
                    </div>
                </div>
            )}
        </div>
    );
}
