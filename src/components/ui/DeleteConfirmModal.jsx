import React from 'react';

const DeleteConfirmModal = ({ title, message, onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCancel} />
        <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-[400px] animate-in zoom-in-95 duration-200">
            <div className="p-6">
                <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-semibold leading-none tracking-tight text-foreground">
                        {title || "Are you absolutely sure?"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {message || "This action cannot be undone. This will permanently delete your data from our servers."}
                    </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground ring-offset-background transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default DeleteConfirmModal;
