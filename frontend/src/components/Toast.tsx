import { useCallback } from 'react';
import type { Toast } from '../contexts/ToastContext';

interface ToastProps extends Toast {
  onRemove: (id: string) => void;
}

export function ToastItem({
  id,
  type,
  title,
  message,
  hash,
  blockExplorerUrl,
  onRemove,
}: ToastProps) {
  const handleDismiss = useCallback(() => {
    onRemove(id);
  }, [id, onRemove]);

  const handleExplore = useCallback(() => {
    if (blockExplorerUrl) {
      window.open(blockExplorerUrl, '_blank');
    }
  }, [blockExplorerUrl]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  const formatHash = (txHash: string) => {
    return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
  };

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite" aria-atomic="true">
      <div className="toast-content">
        <div className="toast-header">
          <span className="toast-icon">{getIcon()}</span>
          <div className="toast-title-section">
            <h4 className="toast-title">{title}</h4>
            {type === 'pending' && <div className="toast-spinner"></div>}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="toast-close"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>

        <div className="toast-body">
          {message && <p className="toast-message">{message}</p>}

          {hash && (
            <div className="toast-hash-container">
              <code className="toast-hash" title={hash}>
                {formatHash(hash)}
              </code>
              {blockExplorerUrl && (
                <button
                  type="button"
                  onClick={handleExplore}
                  className="toast-explore-btn"
                  aria-label="View on block explorer"
                >
                  🔗 View
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onRemove={onRemove} />
      ))}
    </div>
  );
}