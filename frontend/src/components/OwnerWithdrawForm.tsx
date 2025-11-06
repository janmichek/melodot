import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { donateConfig } from "../generated";
import { formatAddressShort } from "../wagmi-config";
import { BalanceDisplay } from "./ui/BalanceDisplay";
import { TxNotification } from "./ui/TxNotification";
import type { Abi } from "viem";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";

interface OwnerWithdrawFormProps {
  contractAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  platformFeeBalance: bigint | undefined;
}

export function OwnerWithdrawForm({
  contractAddress,
  ownerAddress,
  platformFeeBalance,
}: OwnerWithdrawFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (isSubmitting || isWithdrawing || isConfirming) return;

    try {
      setIsSubmitting(true);
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "withdrawPlatformFees",
        args: [ownerAddress],
      });
    } catch (err) {
      console.error("Error withdrawing platform fees:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="owner-card">
      <h3 className="owner-card-title">💰 Platform Fee Withdrawal</h3>
      <p className="owner-card-subtitle">1% fee from all donations</p>

      <div className="owner-info-box">
        <div className="owner-info-row">
          <span className="owner-label">Available Balance:</span>
          <BalanceDisplay
            balance={platformFeeBalance}
            showSymbol={true}
            size="small"
          />
        </div>
        <div className="owner-info-row">
          <span className="owner-label">Recipient Address:</span>
          <span className="owner-value">{formatAddressShort(ownerAddress, 16)}</span>
        </div>
      </div>
{/*todo is needed isWithdrawing || isConfirming*/}
      <Button
        onClick={withdrawPlatformFees}
        disabled={isSubmitting || isWithdrawing || isConfirming || platformFeeBalance === 0n}
        className="owner-withdraw-btn"
      >
        {isWithdrawing || isConfirming ? "Processing..." : "Withdraw Platform Fees"}
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
    </Card>
  );
}