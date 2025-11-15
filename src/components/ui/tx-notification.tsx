import {useEffect, useState} from 'react';
import {clsx} from 'clsx';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {CheckCircle2, Clock, ExternalLink, Loader2, X, XCircle} from 'lucide-react';

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
 * A transaction notification component built with shadcn Alert:
 * - Real-time transaction status updates
 * - Pending, success, and error states with variants
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
  successMessage = 'Transaction successful!',
  pendingMessage = 'Waiting for confirmation...',
  errorMessage = 'Transaction failed',
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

  const getVariant = () => {
    if (isError) return 'destructive';
    if (isSuccess) return 'success';
    return 'info';
  };

  const getIcon = () => {
    if (isError) return <XCircle className="h-4 w-4" />;
    if (isSuccess) return <CheckCircle2 className="h-4 w-4" />;
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    return <Clock className="h-4 w-4" />;
  };

  const getMessage = () => {
    if (isLoading) return pendingMessage;
    if (isSuccess) return successMessage;
    if (isError) return error || errorMessage;
    return null;
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
    <Alert
      variant={getVariant()}
      className={clsx("relative mt-4", className)}
    >
      {getIcon()}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <AlertTitle className="mb-2">{title}</AlertTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <AlertDescription className="space-y-2">
          <p>{getMessage()}</p>

          {hash && (
            <div className="flex items-center gap-2 flex-wrap mt-2">

              {explorerUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  asChild
                >
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View on block explorer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on Explorer
                  </a>
                </Button>
              )}
            </div>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}
