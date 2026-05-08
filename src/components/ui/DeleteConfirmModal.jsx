import React from 'react';

const DeleteConfirmModal = ({ title, message, onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCancel} />
        <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-3">
                <div className="flex flex-col gap-1.5">
                    <h3 className="text-[14px] font-black uppercase tracking-tight text-foreground">
                        {title || "Delete Confirmation"}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        {message || "This action cannot be undone. Are you sure you want to proceed?"}
                    </p>
                </div>
            </div>

            <div className="flex border-t border-border divide-x divide-border">
                <button 
                    onClick={onCancel} 
                    className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:bg-secondary/50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm} 
                    className="flex-1 py-3.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);

export default DeleteConfirmModal;
