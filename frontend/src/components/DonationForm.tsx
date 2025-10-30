import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { donateConfig } from "../generated";
import { CURRENCY_SYMBOL } from "../wagmi-config";
import type { Abi } from "viem";
import { parseEther } from "viem";

interface DonationFormProps {
  contractAddress: `0x${string}`;
  artistId: string;
  onSuccess?: () => void;
  onRequireAuth?: () => void;
}

export function DonationForm({ contractAddress, artistId, onSuccess, onRequireAuth }: DonationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected } = useAccount();
  console.log('artistId', artistId)
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({hash,});
  // todo make transaction loading better


  const donate = async (amount: number) => {
     if (!isConnected) {
      onRequireAuth?.();
      return;
    }

    if (isSubmitting || isWritePending || isConfirming) return;

    try {
      setIsSubmitting(true);
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "donateToArtist",
        args: [artistId],
        value: parseEther(amount.toString()),
      });
    } catch (err) {
      console.error("Error donating:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle successful transaction completion
   *
   * This useEffect is necessary for two important reasons:
   * 1. Trigger the onSuccess callback when the transaction is confirmed on-chain
   * 2. Reset the form state after displaying the success message for 3 seconds
   *
   * We use useEffect instead of handling this in the write function because
   * transaction confirmation happens asynchronously after the write is submitted.
   * The isConfirmed state comes from useWaitForTransactionReceipt hook which
   * monitors the blockchain for transaction confirmation.
   */
  useEffect(() => {
    if (isConfirmed) {
      onSuccess?.();
      // Reset after a brief delay to allow user to see the success message
      setTimeout(() => {
        resetWrite();
      }, 3000);
    }
  }, [isConfirmed, onSuccess, resetWrite]);

  return (
    <div className="contract-form-section">
      <h3 className="contract-form-title">🎵 Donate to Artist</h3>
      <div className="form-group">
        <p className="form-label">Artist ID: {artistId}</p>
        <p className="form-label">Select amount to donate instantly:</p>
        <div className="amount-selector-group">
          {[1, 2, 10].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => donate(amount)}
              disabled={isSubmitting || isWritePending || isConfirming}
              className="btn-amount-selector"
            >
              {isWritePending || isConfirming ? "Donating..." : `${amount} ${CURRENCY_SYMBOL}`}
            </button>
          ))}
        </div>
      </div>

      {hash && (
        <div
          className={`tx-status-box ${
            isConfirmed ? "tx-status-success" : "tx-status-pending"
          }`}
        >
          {isConfirming && <p className="p-text">⏳ Waiting for confirmation...</p>}
          {isConfirmed && (
            <p className="tx-status-text">✅ Donation successful!</p>
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
