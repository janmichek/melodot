import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { donateConfig } from "../generated";
import type { Abi } from "viem";
import { parseEther } from "viem";

interface DonationFormProps {
  contractAddress: `0x${string}`;
  onSuccess?: () => void;
}

export function DonationForm({ contractAddress, onSuccess }: DonationFormProps) {
  const [artistId, setArtistId] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Write contract hook
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle form submission
  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId.trim() || !donationAmount.trim()) return;

    try {
      setIsSubmitting(true);
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "donateToArtist",
        args: [artistId],
        value: parseEther(donationAmount),
      });
    } catch (err) {
      console.error("Error donating:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful transaction
  if (isConfirmed) {
    setArtistId("");
    setDonationAmount("");
    onSuccess?.();
  }

  return (
    <div className="contract-form-section">
      <h3 className="contract-form-title">🎵 Donate to Artist</h3>
      {/*todo change UX of this component to directly submit after clicking on preset. No need to select and submit */}
      <form onSubmit={handleDonation}>
        <div className="form-group">
          <label className="form-label">Artist Music ID</label>
          <input
            type="text"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            placeholder="Enter artist music ID..."
            disabled={isSubmitting || isWritePending || isConfirming}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Donation Amount</label>
          <div className="amount-selector-group">
            {[1, 2, 10].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setDonationAmount(amount.toString())}
                disabled={isSubmitting || isWritePending || isConfirming}
                className={`btn-amount-selector ${
                  donationAmount === amount.toString() ? "active" : ""
                }`}
              >
                {amount} PAS
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={
            !artistId.trim() ||
            !donationAmount.trim() ||
            isSubmitting ||
            isWritePending ||
            isConfirming
          }
          className="btn-success"
        >
          {isWritePending || isConfirming ? "Donating..." : "Donate"}
        </button>
      </form>

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
