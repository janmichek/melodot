import {Button} from "@/components/ui/button"
import {CURRENCY_SYMBOL} from "@/wagmi-config"
import type {DonationCalculationProps} from "@types"

export function DonationCalculation({
  selectedAmount,
  selectedCount,
  totalDonation,
  isDonating,
  isWriting,
  isAllConfirmed,
  isConnected,
  onDonate,
}: DonationCalculationProps) {
  // Only show when not pending and not successful
  if (!selectedAmount || selectedCount === 0 || isDonating || isWriting || isAllConfirmed) {
    return null
  }

  return (
    <div className="space-y-3 pt-2 border-t">
      {selectedCount > 1 && (
        <div className="text-sm text-foreground/70 space-y-1">
          <div className="flex justify-between">
            <span>Amount per artist:</span>
            <span className="font-semibold">{selectedAmount} {CURRENCY_SYMBOL}</span>
          </div>
          <div className="flex justify-between">
            <span>Number of artists:</span>
            <span className="font-semibold">{selectedCount}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t">
            <span>Total to donate:</span>
            <span>{totalDonation} {CURRENCY_SYMBOL}</span>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={onDonate}
        disabled={!selectedAmount || selectedCount === 0}
        variant="success"
        size="lg"
        className="w-full">
        {isConnected ? `Donate ${totalDonation} ${CURRENCY_SYMBOL}` : "Sign In to Donate"}
      </Button>
    </div>
  )
}

