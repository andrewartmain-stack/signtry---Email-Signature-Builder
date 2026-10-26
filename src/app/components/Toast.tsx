"use client"

import React, { createContext, FC, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type ToastType = 'success' | 'error';

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
    action?: { label: string; href: string };
}

type ShowToast = (type: ToastType, message: string, action?: ToastItem['action']) => void;

const ToastContext = createContext<ShowToast>(() => undefined);

// One notification system for the whole dashboard, so every page reports
// success and errors the same way and in the same place.
export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const nextId = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts(current => current.filter(toast => toast.id !== id));
    }, []);

    const show = useCallback<ShowToast>((type, message, action) => {
        const id = nextId.current++;
        // Keep at most three on screen
        setToasts(current => [...current.slice(-2), { id, type, message, action }]);
        setTimeout(() => dismiss(id), type === 'error' ? 6000 : 4000);
    }, [dismiss]);

    const value = useMemo(() => show, [show]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
                aria-live="polite"
            >
                <AnimatePresence initial={false}>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: 16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                            role={toast.type === 'error' ? 'alert' : 'status'}
                            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-[0_16px_40px_-12px_rgba(6,27,49,0.45)]"
                        >
                            {toast.type === 'success'
                                ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal" />
                                : <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#ff8a80]" />}
                            <div className="flex flex-1 flex-col gap-1">
                                <span>{toast.message}</span>
                                {toast.action && (
                                    <a href={toast.action.href} className="w-fit font-medium text-brand underline-offset-4 hover:underline">
                                        {toast.action.label}
                                    </a>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => dismiss(toast.id)}
                                className="-mr-1 cursor-pointer rounded-full p-0.5 text-white/60 hover:text-white"
                                aria-label="Dismiss"
                            >
                                <X className="size-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    return useContext(ToastContext);
}
