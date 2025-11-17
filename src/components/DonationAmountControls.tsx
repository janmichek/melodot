import {CheckButton} from "@/components/ui/check-button"
import {CURRENCY_SYMBOL} from "@/wagmi-config"
import type {DonationAmountControlsProps} from "@types"

const DONATION_AMOUNTS = [1, 2, 10, 50, 100] as const

export function DonationAmountControls({
  selectedAmount,
  onAmountChange,
}: DonationAmountControlsProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground/80">
        Select donation amount per artist
      </label>
      <div className="flex flex-wrap gap-3">
        {DONATION_AMOUNTS.map((amount) => (
          <CheckButton
            key={amount}
            id={`amount-${amount}`}
            checked={selectedAmount === amount}
            onChange={() => onAmountChange(amount)}>
            {`${amount} ${CURRENCY_SYMBOL}`}
          </CheckButton>
        ))}
      </div>
    </div>
  )
}

