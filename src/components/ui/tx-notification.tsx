import {useEffect, useRef, useState} from 'react'
import {clsx} from 'clsx'
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert'
import {Button} from '@/components/ui/button'
import {CheckCircle2, Clock, ExternalLink, X, XCircle} from 'lucide-react'
import {Spinner} from '@/components/ui/spinner'
import type {TxNotificationProps} from '@types'

const BLOCK_EXPLORER_BASE = 'https://blockscout-passet-hub.parity-testnet.parity.io'

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
  isProcessing = false,
  error,
  title = 'Transaction Status',
  successMessage = 'Transaction successful!',
  pendingMessage = 'Waiting for confirmation...',
  errorMessage = 'Transaction failed',
  processingMessage,
  progress,
  transactions = [],
  blockExplorerBaseUrl = BLOCK_EXPLORER_BASE,
  blockExplorerUrl,
  onDismiss,
  autoHideSuccess = true,
  autoHideDelay = 3000,
  className = '',
  showTransactionList = true,
}: TxNotificationProps) {
  // Derive visibility from props
  const isNotificationVisible = hash || isError || isProcessing || (isSuccess && transactions.length > 0)
  const [isDismissed, setIsDismissed] = useState(false)
  const prevIsNotificationVisibleRef = useRef(isNotificationVisible)
  
  // Reset dismissed state when visibility conditions change (using setTimeout to avoid synchronous setState)
  useEffect(() => {
    if (isNotificationVisible && !prevIsNotificationVisibleRef.current) {
      setTimeout(() => {
        setIsDismissed(false)
      }, 0)
    }
    prevIsNotificationVisibleRef.current = isNotificationVisible
  }, [isNotificationVisible])

  // Auto-hide on success
  useEffect(() => {
    if (isSuccess && autoHideSuccess && !isDismissed) {
      const timer = setTimeout(() => {
        setIsDismissed(true)
        onDismiss?.()
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, autoHideSuccess, autoHideDelay, onDismiss, isDismissed])

  // Compute final visibility
  const isVisible = isNotificationVisible && !isDismissed

  // For processing mode or success with transactions, don't require hash
  if (!isVisible || (!hash && !isProcessing && !isError && !(isSuccess && transactions.length > 0))) {
    return null
  }

  const getVariant = () => {
    if (isError) {return 'destructive'}
    if (isSuccess) {return 'success'}
    if (isProcessing || isLoading) {return undefined} // Use custom yellow styling for processing/pending
    return 'info'
  }

  const getIcon = () => {
    if (isError) {return <XCircle className="h-4 w-4" />}
    if (isSuccess) {return <CheckCircle2 className="h-4 w-4" />}
    if (isProcessing) {
      // Use Spinner component so it gets the same positioning as success icon (top left via Alert CSS)
      return <Spinner size="lg" className="text-yellow-500 dark:text-yellow-400" />
    }
    if (isLoading) {return <Spinner size="sm" className="text-yellow-500 dark:text-yellow-400" />}
    return <Clock className="h-4 w-4" />
  }

  const getMessage = () => {
    if (isProcessing) {
      if (progress && processingMessage) {
        const plural = progress.total > 1 ? 's' : ''
        return `${processingMessage}${plural}... (${progress.confirmed}/${progress.total})`
      }
      return processingMessage || pendingMessage
    }
    if (isLoading) {return pendingMessage}
    if (isSuccess) {return successMessage}
    if (isError) {return error || errorMessage}
    return null
  }


  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  // Build explorer URL: use provided URL or construct from hash
  const explorerUrl = blockExplorerUrl || (hash ? `${blockExplorerBaseUrl}/tx/${hash}` : null)
  // Custom styling for processing mode or loading state (yellow)
  const alertClassName = isProcessing || isLoading
    ? clsx("relative mt-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800", className)
    : clsx("relative mt-4", className)

  return (
    <Alert
      variant={getVariant()}
      className={alertClassName}>
      {getIcon()}
      <div className="flex-1">
        {!isProcessing && !(isSuccess && transactions.length > 0) && (
          <div className="flex items-center justify-between">
            <AlertTitle className="mb-2">{title}</AlertTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6"
              onClick={handleDismiss}
              aria-label="Dismiss notification">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {isProcessing && transactions.length > 0 && <AlertTitle className="mb-3">{title}</AlertTitle>}
        {isProcessing && transactions.length === 0 && <AlertTitle className="mb-2">{title}</AlertTitle>}
        {isSuccess && transactions.length > 0 && <AlertTitle className="mb-3">{title}</AlertTitle>}
        <AlertDescription className={(isSuccess && transactions.length > 0) || (isProcessing && transactions.length > 0) ? "space-y-3" : "space-y-2"}>
          {isProcessing && transactions.length === 0 && (
            <p className="text-sm text-foreground/80">{getMessage()}</p>
          )}
          {!isProcessing && !(isSuccess && transactions.length > 0) && (
            <p>{getMessage()}</p>
          )}

          {/* Show transaction list for success with multiple transactions */}
          {isSuccess && transactions.length > 0 && showTransactionList && (
            <>
              <p className="text-sm font-medium">
                View transactions on the block explorer:
              </p>
              <div className="space-y-2">
                {transactions.map((tx, index) => {
                  const txUrl = `${blockExplorerBaseUrl}/tx/${tx.hash}`
                  return (
                    <div key={tx.hash} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-background/50 rounded border">
                      <div className="flex-1 min-w-0">
                        {tx.label && (
                          <p className="text-sm font-medium truncate">{tx.label}</p>
                        )}
                        {tx.description && (
                          <p className="text-xs text-muted-foreground">{tx.description}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs w-full sm:w-auto sm:shrink-0"
                        asChild>
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View transaction ${index + 1} on block explorer`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Tx
                        </a>
                      </Button>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Show single transaction link - hide when pending/processing */}
          {hash && !(isSuccess && transactions.length > 0) && !isProcessing && !isLoading && (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {explorerUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  asChild>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View on block explorer">
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
  )
}
