import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { donateConfig } from "../generated";
import { CURRENCY_SYMBOL } from "../wagmi-config";
import { useToast } from "../hooks/useToast";
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
  const { pending: showPendingToast, success: showSuccessToast, error: showErrorToast } = useToast();
  const [toastId, setToastId] = useState<string>('');

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

  // Show pending toast when transaction is being written
  useEffect(() => {
    if (isWriting && hash) {
      const id = showPendingToast('Donation Status', {
        message: '⏳ Processing donation...',
        hash,
        autoHide: false,
      });
      setToastId(id);
    }
  }, [isWriting, hash, showPendingToast]);

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash && toastId) {
      showSuccessToast('Donation Successful', {
        message: '✅ Donation confirmed on-chain!',
        hash,
        autoHide: true,
        duration: 5000,
        onDismiss: () => {
          onSuccess?.();
          resetWrite();
        },
      });
    }
  }, [isConfirmed, hash, toastId, showSuccessToast, onSuccess, resetWrite]);

  // Show error toast if write fails
  useEffect(() => {
    if (writeError) {
      showErrorToast('Donation Failed', {
        message: writeError.message || 'Failed to process donation',
        autoHide: true,
        duration: 5000,
      });
    }
  }, [writeError, showErrorToast]);

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
    </div>
  );
}
