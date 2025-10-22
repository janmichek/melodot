import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { donateConfig } from "../generated";
import type { Abi } from "viem";
import { parseEther } from "viem";

interface DonationFormProps {
  contractAddress: `0x${string}`;
  onSuccess?: () => void;
  onRequireAuth?: () => void;
}

// Mock artist ID for testing - replace with actual artist ID from discovery
const MOCK_ARTIST_ID = "artist-123-mock";

export function DonationForm({ contractAddress, onSuccess, onRequireAuth }: DonationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected } = useAccount();

  // Write contract hook
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle direct donation with preset amount
  const handleDirectDonation = async (amount: number) => {
    // Check if user is connected, if not trigger auth modal
    if (!isConnected) {
      onRequireAuth?.();
      return;
    }

    if (isSubmitting || isWritePending || isConfirming) return;

    // instead og mock artist id use id from discovery
    try {
      setIsSubmitting(true);
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "donateToArtist",
        args: [MOCK_ARTIST_ID],
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
        <p className="form-label">Artist ID: {MOCK_ARTIST_ID}</p>
        <p className="form-label">Select amount to donate instantly:</p>
        <div className="amount-selector-group">
          {[1, 2, 10].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleDirectDonation(amount)}
              disabled={isSubmitting || isWritePending || isConfirming}
              className="btn-amount-selector"
            >
              {isWritePending || isConfirming ? "Donating..." : `${amount} PAS`}
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

      {/* Error Display */}
      {writeError && (
        <div className="error-box">❌ Error: {writeError.message}</div>
      )}
    </div>
  );
}
