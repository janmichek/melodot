import {useEffect, useState} from "react"
import {useAccount, useWaitForTransactionReceipt, useWriteContract} from "wagmi"
import {donateConfig} from "@/generated"
import {AddressInput} from "@/components/ui/address-input"
import {TxNotification} from "@/components/ui/tx-notification"
import type {Abi} from "viem"
import {isAddress} from "viem"
import {Button} from "@/components/ui/button"
import {CURRENCY_SYMBOL, formatPasBalance} from "@/wagmi-config"
import type {ArtistPayoutFormProps} from "@types"

export function ArtistPayoutForm({
  contractAddress,
  artistId,
  artistBalance,
  onPayoutSuccess,
}: ArtistPayoutFormProps) {
  const [payoutAddress, setPayoutAddress] = useState('')
  const [userError, setUserError] = useState<string | null>(null)
  const {isConnected} = useAccount()

  const {
    writeContract,
    isPending: isPayoutPending,
    data: payoutHash,
    error: writeError,
  } = useWriteContract()

  const txHash = payoutHash

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({hash: txHash as `0x${string}` | undefined})

  // Derive error from writeError, confirmError, or userError
  const payoutError = writeError?.message || confirmError?.message || userError

  const handlePayout = () => {
    if (!payoutAddress || !isAddress(payoutAddress as `0x${string}`)) {
      setUserError('Invalid recipient address')
      return
    }

    setUserError(null)

    // writeContract is synchronous - errors come via writeError state
    writeContract({
      address: contractAddress,
      abi: donateConfig.abi as Abi,
      functionName: 'payoutDonations',
      args: [artistId, payoutAddress as `0x${string}`],
    })
  }

  // Handle successful confirmation
  useEffect(() => {
    if (isConfirmed) {
      onPayoutSuccess?.()
    }
  }, [isConfirmed, onPayoutSuccess])

  // Log errors when they occur
  useEffect(() => {
    if (writeError) {
      console.error('Write error:', writeError)
    }
  }, [writeError])

  useEffect(() => {
    if (confirmError) {
      console.error('Confirm error:', confirmError)
    }
  }, [confirmError])

  return (
    <div className="space-y-4">
      <AddressInput
        value={payoutAddress}
        onChange={setPayoutAddress}
        placeholder="Enter recipient address (0x...)"
        label="Recipient Address"
        error={payoutError}
        isDisabled={!isConnected || isPayoutPending || isConfirming}
        showValidation={true}/>
      <Button
        onClick={handlePayout}
        disabled={!isConnected || !isAddress(payoutAddress as `0x${string}`) || isPayoutPending || isConfirming}
        className="w-full sm:w-auto">
        {isPayoutPending
            ? "Sending transaction..."
            : isConfirming
            ? "Confirming..."
            : artistBalance !== null
            ? `Payout ${formatPasBalance(artistBalance)} ${CURRENCY_SYMBOL}`
            : "Payout All"}
      </Button>

      <TxNotification
        hash={txHash}
        isLoading={isConfirming}
        isSuccess={isConfirmed}
        isError={!!writeError || !!confirmError}
        error={writeError?.message || confirmError?.message}
        title="Payout Status"
        successMessage="Funds paid out to your address!"
        pendingMessage="Processing payout..."
        errorMessage="❌ Payout failed"
        autoHideSuccess={false}
        onDismiss={() => {
            if (isConfirmed) {
              setPayoutAddress('')
              setUserError(null)
            }
          }}/>
    </div>
  )
}
