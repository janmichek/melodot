import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { donateConfig } from "../generated";
import { formatAddressShort } from "../wagmi-config";
import { BalanceDisplay } from "./ui/BalanceDisplay";
import { TxNotification } from "./ui/TxNotification";
import type { Abi } from "viem";

interface AdminWithdrawFormProps {
  contractAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  platformFeeBalance: bigint | undefined;
}

export function AdminWithdrawForm({
  contractAddress,
  ownerAddress,
  platformFeeBalance,
}: AdminWithdrawFormProps) {
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
    <div className="admin-card">
      <h3 className="admin-card-title">💰 Platform Fee Withdrawal</h3>
      <p className="admin-card-subtitle">1% fee from all donations</p>

      <div className="admin-info-box">
        <div className="admin-info-row">
          <span className="admin-label">Available Balance:</span>
          <BalanceDisplay
            balance={platformFeeBalance}
            showSymbol={true}
            size="small"
          />
        </div>
        <div className="admin-info-row">
          <span className="admin-label">Recipient Address:</span>
          <span className="admin-value">{formatAddressShort(ownerAddress, 16)}</span>
        </div>
      </div>

      <button
        onClick={withdrawPlatformFees}
        disabled={isSubmitting || isWithdrawing || isConfirming || platformFeeBalance === 0n}
        className="admin-withdraw-btn"
      >
        {isWithdrawing || isConfirming ? "Processing..." : "Withdraw Platform Fees"}
      </button>

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
    </div>
  );
}
