import {useEffect, useRef} from "react"
import {useWaitForTransactionReceipt, useWriteContract} from "wagmi"
import {donateConfig} from "@/generated"
import {BalanceLabel} from "@/components/ui/balance-label"
import {TxNotification} from "@/components/ui/tx-notification"
import type {Abi} from "viem"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import type {OwnerWithdrawFormProps} from "@types"
import {useQueryClient} from "@tanstack/react-query"
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext"
import {CURRENCY_SYMBOL, formatPasBalance} from "@/wagmi-config"

export function OwnerWithdrawForm({
  contractAddress,
  ownerAddress,
  platformFeeBalance,
  onSuccess,
}: OwnerWithdrawFormProps & {onSuccess?: () => void}) {
  const queryClient = useQueryClient()
  const {address} = useWeb3AuthContext()
  const withdrewAfterSettle = useRef(false)

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
  }, [isConfirmed, address, queryClient, onSuccess])

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
    withdrewAfterSettle.current = false
    writeSettle({
      address: contractAddress,
      abi: donateConfig.abi as Abi,
      functionName: "settlePlatformFees",
    })
  }

  return (
    <Card className="space-y-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          💰 Platform Fee Withdrawal
        </CardTitle>
        <CardDescription>1% fee from all donations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {!isBusy && !isConfirmed && (
          <Button
            onClick={settleThenWithdraw}
            disabled={platformFeeBalance === 0n}
            className="w-full sm:w-auto">
            Withdraw {formatPasBalance(platformFeeBalance)} {CURRENCY_SYMBOL}
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
      </CardFooter>
    </Card>
  )
}
