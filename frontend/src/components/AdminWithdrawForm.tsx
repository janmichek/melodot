import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { donateConfig } from "../generated";
import { formatAddressShort } from "../wagmi-config";
import { BalanceDisplay } from "./ui/BalanceDisplay";
import { useToast } from "../hooks/useToast";
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
  const [toastId, setToastId] = useState<string>('');
  const { pending: showPendingToast, success: showSuccessToast, error: showErrorToast } = useToast();

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

  // Show pending toast when transaction is being written
  useEffect(() => {
    if (isWithdrawing && hash) {
      const id = showPendingToast('Withdrawal Status', {
        message: '⏳ Processing withdrawal...',
        hash,
        autoHide: false,
      });
      setToastId(id);
    }
  }, [isWithdrawing, hash, showPendingToast]);

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash && toastId) {
      showSuccessToast('Withdrawal Successful', {
        message: '✅ Platform fees withdrawn!',
        hash,
        autoHide: true,
        duration: 5000,
      });
    }
  }, [isConfirmed, hash, toastId, showSuccessToast]);

  // Show error toast if write fails
  useEffect(() => {
    if (writeError) {
      showErrorToast('Withdrawal Failed', {
        message: writeError.message || 'Failed to process withdrawal',
        autoHide: true,
        duration: 5000,
      });
    }
  }, [writeError, showErrorToast]);

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
    </div>
  );
}
