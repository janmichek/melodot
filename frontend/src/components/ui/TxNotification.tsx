 import { useEffect, useState } from 'react';

const BLOCK_EXPLORER_BASE = 'https://blockscout-passet-hub.parity-testnet.parity.io';

export interface TxNotificationProps {
  hash?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  error?: string | null;
  title?: string;
  successMessage?: string;
  pendingMessage?: string;
  errorMessage?: string;
  onDismiss?: () => void;
  blockExplorerUrl?: string;
  autoHideSuccess?: boolean;
  autoHideDelay?: number;
  className?: string;
}

/**
 * TxNotification Component
 *
 * A polkadot-ui inspired transaction notification component with:
 * - Real-time transaction status updates
 * - Pending, success, and error states
 * - Optional block explorer link
 * - Auto-hide functionality for success state
 * - Dismissible notification
 * - Accessibility features
 */
export function TxNotification({
  hash,
  isLoading = false,
  isSuccess = false,
  isError = false,
  error,
  title = 'Transaction Status',
  successMessage = '✅ Transaction successful!',
  pendingMessage = '⏳ Waiting for confirmation...',
  errorMessage = '❌ Transaction failed',
  onDismiss,
  blockExplorerUrl,
  autoHideSuccess = true,
  autoHideDelay = 3000,
  className = '',
}: TxNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hash || isError) {
      setIsVisible(true);
    }
  }, [hash, isError]);

  useEffect(() => {
    if (isSuccess && autoHideSuccess) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, autoHideSuccess, autoHideDelay, onDismiss]);

  if (!isVisible || !hash) {
    return null;
  }

  const getStatusClass = () => {
    if (isError) return 'tx-notification-error';
    if (isSuccess) return 'tx-notification-success';
    return 'tx-notification-pending';
  };

  const getStatusIcon = () => {
    if (isError) return '❌';
    if (isSuccess) return '✅';
    return '⏳';
  };

  const formatHash = (txHash: string) => {
    return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // Build explorer URL: use provided URL or construct from hash
  const explorerUrl = blockExplorerUrl || (hash ? `${BLOCK_EXPLORER_BASE}/tx/${hash}` : null);

  return (
    <div
      className={`tx-notification ${getStatusClass()} ${className}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="tx-notification-content">
        <div className="tx-notification-header">
          <span className="tx-notification-icon">{getStatusIcon()}</span>
          <div className="tx-notification-title-section">
            <h4 className="tx-notification-title">{title}</h4>
            {isLoading && (
              <div className="tx-notification-spinner"></div>
            )}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="tx-notification-close"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>

        <div className="tx-notification-body">
          {isLoading && (
            <p className="tx-notification-message">{pendingMessage}</p>
          )}
          {isSuccess && (
            <p className="tx-notification-message tx-notification-success-message">
              {successMessage}
            </p>
          )}
          {isError && (
            <p className="tx-notification-message tx-notification-error-message">
              {error || errorMessage}
            </p>
          )}

          <div className="tx-notification-hash-container">
            {explorerUrl ? (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-notification-hash-link"
                title={`View transaction ${hash} on block explorer`}
              >
                <code className="tx-notification-hash">
                  {formatHash(hash)}
                </code>
              </a>
            ) : (
              <code className="tx-notification-hash" title={hash}>
                {formatHash(hash)}
              </code>
            )}
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-notification-explore-btn"
                aria-label="View on block explorer"
              >
                🔗 View on Explorer
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
