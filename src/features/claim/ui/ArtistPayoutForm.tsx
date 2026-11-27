import {useEffect, useRef, useState} from "react"
import {useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi"
import {donateConfig} from "@/shared/config"
import {AddressInput} from "@/shared/ui/address-input"
import {TxNotification} from "@/shared/ui/tx-notification"
import type {Abi} from "viem"
import {isAddress} from "viem"
import {Button} from "@/shared/ui/button"
import {CURRENCY_SYMBOL, formatPasBalance} from "@/shared/config"
import type {ArtistPayoutFormProps} from "@types"

export function ArtistPayoutForm({
  contractAddress,
  artistId,
  artistBalance,
  onPayoutSuccess,
}: ArtistPayoutFormProps) {
  const [payoutAddress, setPayoutAddress] = useState('')
  const [userError, setUserError] = useState<string | null>(null)
  const {address, isConnected} = useAccount()
  const withdrewAfterSettle = useRef(false)

  // A rejected withdraw after a successful settle leaves funds in
  // pendingWithdrawals. Track them so the user can still take them out.
  const {data: pendingData, refetch: refetchPending} = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: 'pendingWithdrawals',
    args: address ? [address] : undefined,
    query: {enabled: !!address},
  })
  const pendingBalance = typeof pendingData === 'bigint' ? pendingData : 0n

  const {
    writeContract: writeSettle,
    isPending: isSettlePending,
    data: settleHash,
    error: settleWriteError,
  } = useWriteContract()

  const {
    isLoading: isSettleConfirming,
    isSuccess: isSettleConfirmed,
    error: settleConfirmError,
  } = useWaitForTransactionReceipt({hash: settleHash})

  const {
    writeContract: writeWithdraw,
    isPending: isWithdrawPending,
    data: withdrawHash,
    error: withdrawWriteError,
  } = useWriteContract()

  const {
    isLoading: isWithdrawConfirming,
    isSuccess: isWithdrawConfirmed,
    error: withdrawConfirmError,
  } = useWaitForTransactionReceipt({hash: withdrawHash})

  const writeError = settleWriteError || withdrawWriteError
  const confirmError = settleConfirmError || withdrawConfirmError
  const payoutError = writeError?.message || confirmError?.message || userError
  const isBusy = isSettlePending || isSettleConfirming || isWithdrawPending || isWithdrawConfirming
  const txHash = withdrawHash ?? settleHash

  const handlePayout = () => {
    if (!payoutAddress || !isAddress(payoutAddress as `0x${string}`)) {
      setUserError('Invalid recipient address')
      return
    }

    setUserError(null)
    withdrewAfterSettle.current = false

    // After a reload, a settled balance is no longer in getArtistInfo; it sits
    // in pendingWithdrawals and must be withdrawn directly.
    if (((artistBalance ?? 0n) === 0n || isSettleConfirmed) && pendingBalance > 0n) {
      writeWithdraw({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "withdraw",
        args: [payoutAddress as `0x${string}`],
      })
      return
    }

    writeSettle({
      address: contractAddress,
      abi: donateConfig.abi as Abi,
      functionName: "settleDonations",
      args: [artistId],
    })
  }

  useEffect(() => {
    if (!isSettleConfirmed || withdrewAfterSettle.current) {
      return
    }
    if (!payoutAddress || !isAddress(payoutAddress as `0x${string}`)) {
      return
    }
    withdrewAfterSettle.current = true
    writeWithdraw({
      address: contractAddress,
      abi: donateConfig.abi as Abi,
      functionName: "withdraw",
      args: [payoutAddress as `0x${string}`],
    })
  }, [isSettleConfirmed, payoutAddress, contractAddress, writeWithdraw])

  useEffect(() => {
    if (isSettleConfirmed) {
      void refetchPending()
    }
  }, [isSettleConfirmed, refetchPending])

  useEffect(() => {
    if (isWithdrawConfirmed) {
      void refetchPending()
      onPayoutSuccess?.()
    }
  }, [isWithdrawConfirmed, onPayoutSuccess, refetchPending])

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
        isDisabled={!isConnected || isBusy}
        showValidation={true}/>
      <Button
        onClick={handlePayout}
        disabled={
          !isConnected ||
          !isAddress(payoutAddress as `0x${string}`) ||
          isBusy ||
          ((artistBalance ?? 0n) === 0n && pendingBalance === 0n)
        }
        className="w-full sm:w-auto">
        {isSettlePending || isSettleConfirming
            ? "Settling..."
            : isWithdrawPending || isWithdrawConfirming
            ? "Withdrawing..."
            : artistBalance !== null && artistBalance > 0n
            ? `Payout ${formatPasBalance(artistBalance)} ${CURRENCY_SYMBOL}`
            : pendingBalance > 0n
            ? `Withdraw ${formatPasBalance(pendingBalance)} ${CURRENCY_SYMBOL}`
            : "Payout All"}
      </Button>

      <TxNotification
        hash={txHash}
        isLoading={isSettleConfirming || isWithdrawConfirming}
        isSuccess={isWithdrawConfirmed}
        isError={!!writeError || !!confirmError}
        error={writeError?.message || confirmError?.message}
        title="Payout Status"
        successMessage="Funds paid out to your address!"
        pendingMessage="Processing payout..."
        errorMessage="❌ Payout failed"
        autoHideSuccess={false}
        onDismiss={() => {
            if (isWithdrawConfirmed) {
              setPayoutAddress('')
              setUserError(null)
            }
          }}/>
    </div>
  )
}
