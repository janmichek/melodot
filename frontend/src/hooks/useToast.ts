import { useContext } from 'react';
import { ToastContext, type Toast, type ToastType } from '../contexts/ToastContext';

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const toast = (
    type: ToastType,
    title: string,
    options?: {
      message?: string;
      hash?: string;
      blockExplorerUrl?: string;
      autoHide?: boolean;
      duration?: number;
      onDismiss?: () => void;
    }
  ) => {
    return context.addToast({
      type,
      title,
      message: options?.message,
      hash: options?.hash,
      blockExplorerUrl: options?.blockExplorerUrl,
      autoHide: options?.autoHide,
      duration: options?.duration,
      onDismiss: options?.onDismiss,
    });
  };

  return {
    toast,
    success: (title: string, options?: Omit<Parameters<typeof toast>[2], 'type'>) =>
      toast('success', title, options),
    error: (title: string, options?: Omit<Parameters<typeof toast>[2], 'type'>) =>
      toast('error', title, options),
    info: (title: string, options?: Omit<Parameters<typeof toast>[2], 'type'>) =>
      toast('info', title, options),
    pending: (title: string, options?: Omit<Parameters<typeof toast>[2], 'type'>) =>
      toast('pending', title, options),
    removeToast: context.removeToast,
    clearToasts: context.clearToasts,
  };
}