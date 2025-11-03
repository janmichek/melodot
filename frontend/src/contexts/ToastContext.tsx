import React, { createContext, useCallback, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'pending';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  hash?: string;
  blockExplorerUrl?: string;
  autoHide?: boolean;
  duration?: number;
  onDismiss?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string | void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 11);
      const newToast: Toast = {
        ...toast,
        id,
        autoHide: toast.autoHide !== false,
        duration: toast.duration ?? 3000,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-hide if enabled
      if (newToast.autoHide) {
        const timer = setTimeout(() => {
          removeToast(id);
          newToast.onDismiss?.();
        }, newToast.duration);

        return () => clearTimeout(timer);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
}