import {clsx} from "clsx"
import {CURRENCY_SYMBOL, formatPasBalance} from "@/wagmi-config"
import type {BalanceLabelProps} from "@types"

const containerStyles: Record<
  NonNullable<BalanceLabelProps["size"]>,
  string
> = {
  small: "gap-1 p-2 text-xs",
  medium: "gap-2 p-3 text-sm",
  large: "gap-3 p-4 text-base",
}

const amountStyles: Record<NonNullable<BalanceLabelProps["size"]>, string> = {
  small: "text-sm",
  medium: "text-lg",
  large: "text-2xl",
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
        "flex flex-col rounded-lg bg-card/40 text-card-foreground backdrop-blur",
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
                "font-semibold text-foreground tabular-nums",
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

