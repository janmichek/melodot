import { toast as sonnerToast, Renderable } from 'sonner';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastOptions {
  message?: string;
  hash?: string;
  blockExplorerUrl?: string;
  duration?: number;
  onDismiss?: () => void;
}

/**
 * Custom toast hook that wraps Sonner
 * Maintains API compatibility with the previous custom toast solution
 */
export function useSonnerToast() {
  const createToastContent = (
    title: string,
    options?: ToastOptions
  ): Renderable => {
    return (
      <div className="flex flex-col gap-2">
        <div className="font-semibold">{title}</div>
        {options?.message && (
          <div className="text-sm opacity-90">{options.message}</div>
        )}
        {options?.hash && (
          <div className="flex items-center gap-2">
            <code className="text-xs bg-black/20 px-2 py-1 rounded">
              {options.hash.slice(0, 6)}...{options.hash.slice(-4)}
            </code>
            {options?.blockExplorerUrl && (
              <a
                href={options.blockExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline hover:opacity-80"
              >
                View
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return {
    success: (title: string, options?: ToastOptions) => {
      sonnerToast.success(createToastContent(title, options), {
        duration: options?.duration ?? 3000,
        onDismiss: options?.onDismiss,
      });
    },
    error: (title: string, options?: ToastOptions) => {
      sonnerToast.error(createToastContent(title, options), {
        duration: options?.duration ?? 4000,
        onDismiss: options?.onDismiss,
      });
    },
    info: (title: string, options?: ToastOptions) => {
      sonnerToast.info(createToastContent(title, options), {
        duration: options?.duration ?? 3000,
        onDismiss: options?.onDismiss,
      });
    },
    loading: (title: string, options?: ToastOptions) => {
      return sonnerToast.loading(createToastContent(title, options), {
        duration: options?.duration,
        onDismiss: options?.onDismiss,
      });
    },
    promise: sonnerToast.promise,
    dismiss: sonnerToast.dismiss,
  };
}
