import {CURRENCY_SYMBOL, formatPasBalance} from '../../wagmi-config';

export interface BalanceDisplayProps {
  balance?: bigint;
  label?: string;
  showSymbol?: boolean;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * BalanceDisplay Component
 *
 * A polkadot-ui inspired balance display component with:
 * - Formatted on-chain balance with proper decimal handling
 * - Loading state indicator
 * - Optional label and currency symbol display
 * - Responsive sizing options
 * - Accessible markup
 */
export function BalanceDisplay({
  balance,
  label,
  showSymbol = true,
  isLoading = false,
  size = 'medium',
  className = '',
}: BalanceDisplayProps) {

  return (
    <div className={`balance-display balance-display-${size} ${className}`}>
      {label && (
        <span className="balance-display-label">{label}</span>
      )}

      <div className="balance-display-value-container">
        {isLoading ? (
          <div className="balance-display-skeleton">
            <div className="balance-skeleton-bar"></div>
          </div>
        ) : (
          <div className="balance-display-amount">
            <span className="balance-amount-value">
              {balance ? formatPasBalance(balance) : 0}
            </span>
            {showSymbol && (
              <span className="balance-amount-symbol">{CURRENCY_SYMBOL}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
