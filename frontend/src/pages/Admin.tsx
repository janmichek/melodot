import { useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { donateConfig } from "../generated";
import { CURRENCY_SYMBOL } from "../wagmi-config";
import type { Abi } from "viem";
import { formatUnits } from "viem";

interface AdminProps {
  contractAddress: `0x${string}`;
}

export function Admin({ contractAddress }: AdminProps) {
  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read contract owner
  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "owner",
  });

  // Read total tip fee accumulated (1% of all donations)
  const {
    data: tipFeeBalance,
    isLoading: isTipFeeLoading
  } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "getTipFeeBalance",
  });

  // Withdraw tip fees
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  const handleWithdrawTipFees = async () => {
    if (!isOwner || !address) {
      alert("You are not the contract owner");
      return;
    }

    if (isSubmitting || isWritePending || isConfirming) return;

    try {
      setIsSubmitting(true);
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "withdrawTipFees",
        args: [address],
        gas: BigInt(300000),
        // Fixed gas limit to avoid gas estimation issues
      });
    } catch (err) {
      console.error("Error withdrawing tip fees:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!address) {
    return (
      <div className="admin-section">
        <h2 className="admin-title">🔐 Admin Panel</h2>
        <div className="error-box">Please connect your wallet to access the admin panel</div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="admin-section">
        <h2 className="admin-title">🔐 Admin Panel</h2>
        <div className="error-box">
          You are not authorized to access this panel. Only the contract owner can withdraw tip fees.
          <p style={{ marginTop: "12px", fontSize: "12px" }}>
            Contract Owner: {owner ? `${String(owner).slice(0, 10)}...` : "Loading..."}
          </p>
          <p style={{ marginTop: "8px", fontSize: "12px" }}>
            Your Address: {address ? `${address.slice(0, 10)}...` : "Not connected"}
          </p>
        </div>
      </div>
    );
  }

  const formattedTipFee = tipFeeBalance
    ? parseFloat(formatUnits(BigInt(tipFeeBalance.toString()), 18)).toFixed(2)
    : "0.00";

  return (
    <div className="admin-section">
      <h2 className="admin-title">🔐 Admin Panel</h2>

      <div className="admin-card">
        <h3 className="admin-card-title">💰 Tip Fee Withdrawal</h3>
        <p className="admin-card-subtitle">1% fee from all donations</p>

        <div className="admin-info-box">
          <div className="admin-info-row">
            <span className="admin-label">Available Balance:</span>
            <span className="admin-value">{formattedTipFee} {CURRENCY_SYMBOL}</span>
          </div>
          <div className="admin-info-row">
            <span className="admin-label">Contract Owner:</span>
            <span className="admin-value">{owner ? `${String(owner).slice(0, 16)}...` : "Loading..."}</span>
          </div>
        </div>

        <button
          onClick={handleWithdrawTipFees}
          disabled={isSubmitting || isWritePending || isConfirming || tipFeeBalance === 0n}
          className="admin-withdraw-btn"
        >
          {isWritePending || isConfirming ? "Processing..." : "Withdraw Tip Fees"}
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

      <div className="admin-info-section">
        <h3 className="admin-info-title">ℹ️ How it works</h3>
        <ul className="admin-info-list">
          <li>Every donation to artists includes a 1% tip fee</li>
          <li>Tip fees accumulate in the contract balance</li>
          <li>Only the contract owner can withdraw accumulated tip fees</li>
          <li>Funds are sent to the owner's wallet address</li>
        </ul>
      </div>
    </div>
  );
}
