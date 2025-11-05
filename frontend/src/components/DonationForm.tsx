import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { donateConfig } from "../generated";
import { CURRENCY_SYMBOL } from "../wagmi-config";
import { TxNotification } from "./ui/TxNotification";
import type { Abi } from "viem";
import { parseEther } from "viem";

interface DonationFormProps {
  contractAddress: `0x${string}`;
  artistId: string;
  onSuccess?: () => void;
  onRequireAuth?: () => void;
}

export function DonationForm({ contractAddress, artistId, onSuccess, onRequireAuth }: DonationFormProps) {
  const [isDonating, setIsDonating] = useState(false);
  const { isConnected } = useAccount();

  const {
    data: hash,
    writeContract,
    isPending: isWriting,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({hash,});

  // Call onSuccess callback when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      onSuccess?.();
    }
  }, [isConfirmed, onSuccess]);

  const donate = async (amount: number) => {
     if (!isConnected) {
      onRequireAuth?.();
      return;
    }

    if (isDonating || isWriting || isConfirming) return;

    try {
      setIsDonating(true);
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "donateToArtist",
        args: [artistId],
        value: parseEther(amount.toString()),
        // gas: BigInt(300000), // Fixed gas limit to avoid gas estimation issues
      });
    } catch (err) {
      console.error("Error donating:", err);
    } finally {
      setIsDonating(false);
    }
  };

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
              disabled={isDonating || isWriting || isConfirming}
              className="btn-amount-selector"
              style={{ display: isWriting || isConfirming ? 'none' : 'inline-flex' }}
            >
              {`${amount} ${CURRENCY_SYMBOL}`}
            </button>
          ))}
        </div>
      </div>

      <TxNotification
        hash={hash}
        isLoading={isConfirming}
        isSuccess={isConfirmed}
        isError={!!writeError}
        error={writeError?.message}
        title="Donation Status"
        successMessage="✅ Donation confirmed on-chain!"
        pendingMessage="⏳ Processing donation..."
        errorMessage="❌ Donation failed"
        autoHideSuccess={false}
      />
    </div>
  );
}
