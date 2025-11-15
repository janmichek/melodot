import {useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "@/generated";
import {formatAddressShort} from "@/wagmi-config";
import {BalanceDisplay} from "@/components/ui/balance-display";
import {TxNotification} from "@/components/ui/tx-notification";
import type {Abi} from "viem";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

interface OwnerWithdrawFormProps {
  contractAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  platformFeeBalance: bigint;
}

export function OwnerWithdrawForm({
  contractAddress,
  ownerAddress,
  platformFeeBalance,
}: OwnerWithdrawFormProps) {
  const {
    data: hash,
    writeContract,
    isPending: isWithdrawing,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });

  const withdrawPlatformFees = async () => {
    if (isWithdrawing || isConfirming) return;

    try {
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "withdrawPlatformFees",
        args: [ownerAddress],
      });
    } catch (err) {
      console.error("Error withdrawing platform fees:", err);
    }
  };

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
          <BalanceDisplay
            balance={platformFeeBalance}
            showSymbol={true}
            size="medium"
          />
        </div>
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            Recipient Address
          </span>
          <span className="rounded-md bg-muted/30 px-2 py-1 text-sm font-mono">
            {formatAddressShort(ownerAddress, 16)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          onClick={withdrawPlatformFees}
          disabled={isWithdrawing || isConfirming || platformFeeBalance === 0n}
          className="w-full sm:w-auto"
        >
          {isWithdrawing || isConfirming
            ? "Processing..."
            : "Withdraw Platform Fees"}
        </Button>

        <TxNotification
          hash={hash}
          isLoading={isConfirming}
          isSuccess={isConfirmed}
          isError={!!writeError}
          error={writeError?.message}
          title="Withdrawal Status"
          successMessage="✅ Platform fees withdrawn!"
          pendingMessage="⏳ Processing withdrawal..."
          errorMessage="❌ Withdrawal failed"
          autoHideSuccess={false}
        />
      </CardFooter>
    </Card>
  );
}
