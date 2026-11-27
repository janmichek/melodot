import {clsx} from "clsx"
import {CURRENCY_SYMBOL, formatPasBalance} from "@/shared/config"
import type {BalanceLabelProps} from "@types"

const containerStyles: Record<
  NonNullable<BalanceLabelProps["size"]>,
  string
> = {
  small: "gap-1 text-xs",
  medium: "gap-1.5 text-sm",
  large: "gap-2 text-base",
}

const amountStyles: Record<NonNullable<BalanceLabelProps["size"]>, string> = {
  small: "font-display text-lg",
  medium: "font-display text-2xl",
  large: "font-display text-4xl",
}

const skeletonStyles: Record<NonNullable<BalanceLabelProps["size"]>, string> =
  {
    small: "h-3 w-16",
    medium: "h-4 w-24",
    large: "h-5 w-32",
  }

export function BalanceLabel({
  balance,
  label,
  showSymbol = true,
  isLoading = false,
  size = "medium",
  className,
}: BalanceLabelProps) {
  const formattedBalance =
    balance !== undefined ? formatPasBalance(balance) : "0.00"

  return (
    <div
      className={clsx(
        "flex flex-col text-card-foreground",
        containerStyles[size],
        className
      )}>
      {label && (
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      )}

      <div className="flex items-baseline gap-2">
        {isLoading ? (
          <span
            className={clsx(
              "animate-pulse rounded bg-muted/60",
              skeletonStyles[size]
            )}/>
        ) : (
          <>
            <span
              className={clsx(
                "font-medium text-foreground tabular-nums",
                amountStyles[size]
              )}>
              {formattedBalance}
            </span>
            {showSymbol && (
              <span className="text-xs font-medium text-muted-foreground">
                {CURRENCY_SYMBOL}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

