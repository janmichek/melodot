import {useEffect, useRef} from "react"
import {useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi"
import {donateConfig} from "@/shared/config"
import {BalanceLabel} from "@/shared/ui/balance-label"
import {TxNotification} from "@/shared/ui/tx-notification"
import type {Abi} from "viem"
import {Button} from "@/shared/ui/button"
import type {OwnerWithdrawFormProps} from "@types"
import {useQueryClient} from "@tanstack/react-query"
import {useWeb3AuthContext} from "@/entities/contract"
import {CURRENCY_SYMBOL, formatPasBalance} from "@/shared/config"

export function OwnerWithdrawForm({
  contractAddress,
  ownerAddress,
  platformFeeBalance,
  onSuccess,
}: OwnerWithdrawFormProps & {onSuccess?: () => void}) {
  const queryClient = useQueryClient()
  const {address} = useWeb3AuthContext()
  const withdrewAfterSettle = useRef(false)

  // Fees can sit in pendingWithdrawals if the withdraw step is rejected after
  // a successful settle; keep them visible so the owner can retry.
  const {data: pendingData, refetch: refetchPending} = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: 'pendingWithdrawals',
    args: address ? [address] : undefined,
    query: {enabled: !!address},
  })
  const pendingBalance = typeof pendingData === 'bigint' ? pendingData : 0n
  const availableBalance = platformFeeBalance + pendingBalance

  const {
    data: settleHash,
    writeContract: writeSettle,
    isPending: isSettling,
    error: settleWriteError,
  } = useWriteContract()

  const {
    isLoading: isSettleConfirming,
    isSuccess: isSettleConfirmed,
  } = useWaitForTransactionReceipt({hash: settleHash})

  const {
    data: withdrawHash,
    writeContract: writeWithdraw,
    isPending: isWithdrawing,
    error: withdrawWriteError,
  } = useWriteContract()

  const {
    isLoading: isWithdrawConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({hash: withdrawHash})

  const writeError = settleWriteError || withdrawWriteError
  const hash = withdrawHash ?? settleHash
  const isBusy = isSettling || isSettleConfirming || isWithdrawing || isWithdrawConfirming

  useEffect(() => {
    if (isConfirmed && address) {
      void refetchPending()
      queryClient.invalidateQueries({
        queryKey: ['readContract', {
          functionName: 'getPlatformFeeBalance',
        }],
      })
      queryClient.invalidateQueries({
        queryKey: ['balance', {address}],
      })
      onSuccess?.()
    }
  }, [isConfirmed, address, queryClient, onSuccess, refetchPending])

  useEffect(() => {
    if (isSettleConfirmed) {
      void refetchPending()
    }
  }, [isSettleConfirmed, refetchPending])

  useEffect(() => {
    if (!isSettleConfirmed || withdrewAfterSettle.current) {
      return
    }
    withdrewAfterSettle.current = true
    writeWithdraw({
      address: contractAddress,
      abi: donateConfig.abi as Abi,
      functionName: "withdraw",
      args: [ownerAddress],
    })
  }, [isSettleConfirmed, contractAddress, ownerAddress, writeWithdraw])

  const settleThenWithdraw = () => {
    if (isBusy) {return}
    if ((platformFeeBalance === 0n || isSettleConfirmed) && pendingBalance > 0n) {
      writeWithdraw({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "withdraw",
        args: [ownerAddress],
      })
      return
    }
    withdrewAfterSettle.current = false
    writeSettle({
      address: contractAddress,
      abi: donateConfig.abi as Abi,
      functionName: "settlePlatformFees",
    })
  }

  return (
    <div className="paper-card p-6 sm:p-8">
      <p className="eyebrow text-acid">Owner payout</p>
      <h2 className="mt-2 font-display text-4xl">Platform fees</h2>
      <p className="mt-2 text-sm text-muted-foreground">1% of every donation, settled in PAS.</p>
      <div className="mt-6 space-y-5">
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Available Balance
          </span>
          <BalanceLabel
            balance={platformFeeBalance}
            showSymbol={true}
            size="medium"/>
        </div>
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Recipient Address (Owner)
          </span>
          <div className="rounded-md bg-muted/30 px-2 py-1 text-sm font-mono">
            {ownerAddress}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4 border-t border-border/70 pt-5">
        {!isBusy && !isConfirmed && (
          <Button
            onClick={settleThenWithdraw}
            disabled={isBusy || availableBalance === 0n}
            className="w-full sm:w-auto">
            Withdraw {formatPasBalance(availableBalance)} {CURRENCY_SYMBOL}
          </Button>
        )}
        <TxNotification
          hash={hash}
          isProcessing={isBusy}
          isSuccess={isConfirmed}
          isError={!!writeError}
          error={writeError?.message}
          title="Withdrawal Status"
          successMessage="✅ Platform fees withdrawn!"
          processingMessage="Please wait, Processing withdrawal..."
          errorMessage="❌ Withdrawal failed"
          autoHideSuccess={false}/>
      </div>
    </div>
  )
}
