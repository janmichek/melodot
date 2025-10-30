import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { donateConfig } from "../generated";
import { CURRENCY_SYMBOL, formatAddressShort, formatPasBalance } from "../wagmi-config";
import type { Abi } from "viem";

interface AdminWithdrawFormProps {
  contractAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  tipFeeBalance: bigint | undefined;
}

export function AdminWithdrawForm({
  contractAddress,
  ownerAddress,
  tipFeeBalance,
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

  const withdrawTips = async () => {
    if (isSubmitting || isWithdrawing || isConfirming) return;

    try {
      setIsSubmitting(true);
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "withdrawTipFees",
        args: [ownerAddress],
        gas: BigInt(300000),
        // Fixed gas limit to avoid gas estimation issues
      });
    } catch (err) {
      console.error("Error withdrawing tip fees:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedTipFee = tipFeeBalance ? formatPasBalance(tipFeeBalance) : "0.00";

  return (
    <div className="admin-card">
      <h3 className="admin-card-title">💰 Tip Fee Withdrawal</h3>
      <p className="admin-card-subtitle">1% fee from all donations</p>

      <div className="admin-info-box">
        <div className="admin-info-row">
          <span className="admin-label">Available Balance:</span>
          <span className="admin-value">{formattedTipFee} {CURRENCY_SYMBOL}</span>
        </div>
        <div className="admin-info-row">
          <span className="admin-label">Recipient Address:</span>
          <span className="admin-value">{formatAddressShort(ownerAddress, 16)}</span>
        </div>
      </div>

      <button
        onClick={withdrawTips}
        disabled={isSubmitting || isWithdrawing || isConfirming || tipFeeBalance === 0n}
        className="admin-withdraw-btn"
      >
        {isWithdrawing || isConfirming ? "Processing..." : "Withdraw Tip Fees"}
      </button>

      {hash && (
        <div
          className={`tx-status-box ${
            isConfirmed ? "tx-status-success" : "tx-status-pending"
          }`}
        >
          {isConfirming && <p className="p-text">⏳ Waiting for confirmation...</p>}
          {isConfirmed && (
            <p className="tx-status-text">✅ Withdrawal successful!</p>
          )}
          <p className="tx-hash">Tx: {hash}</p>
        </div>
      )}

      {writeError && (
        <div className="error-box">❌ Error: {writeError.message}</div>
      )}
    </div>
  );
}
