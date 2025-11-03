import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { donateConfig } from "../generated";
import { AddressInput } from "./ui/AddressInput";
import { useToast } from "../hooks/useToast";
import type { Abi } from "viem";
import { isAddress } from "viem";

interface ArtistWithdrawFormProps {
  contractAddress: `0x${string}`;
  artistId: string;
  onWithdrawSuccess?: () => void;
}

export function ArtistWithdrawForm({
  contractAddress,
  artistId,
  onWithdrawSuccess,
}: ArtistWithdrawFormProps) {
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [toastId, setToastId] = useState<string>('');
  const { isConnected } = useAccount();
  const { pending: showPendingToast, success: showSuccessToast, error: showErrorToast } = useToast();

  const {
    writeContract: withdrawWriteContract,
    isPending: isWithdrawPending,
    data: withdrawHash,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });

  const handleWithdraw = async () => {
    if (!artistId) {
      setWithdrawError('Please select an artist first');
      return;
    }

    if (!withdrawAddress || !isAddress(withdrawAddress as `0x${string}`)) {
      setWithdrawError('Invalid recipient address');
      return;
    }

    if (!contractAddress) {
      setWithdrawError('Contract address not found');
      return;
    }

    setWithdrawError(null);
    setTxHash(undefined);

    try {
      withdrawWriteContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: 'withdrawDonate',
        args: [artistId, withdrawAddress as `0x${string}`],
      });
    } catch (error: any) {
      const errorMessage = error?.details?.errors?.[0]?.message ||
                          error?.shortMessage ||
                          error?.message ||
                          'Failed to withdraw';
      setWithdrawError(errorMessage);
      console.error('Withdraw error:', error);
    }
  };

  // Track the hash when the write transaction completes
  useEffect(() => {
    if (withdrawHash) {
      setTxHash(withdrawHash);
      console.log('Withdrawal transaction submitted:', withdrawHash);
    }
  }, [withdrawHash]);

  // Show pending toast when transaction is being written
  useEffect(() => {
    if (isWithdrawPending && withdrawHash) {
      const id = showPendingToast('Withdrawal Status', {
        message: '⏳ Processing withdrawal...',
        hash: withdrawHash,
        autoHide: false,
      });
      setToastId(id);
    }
  }, [isWithdrawPending, withdrawHash, showPendingToast]);

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && withdrawHash && toastId) {
      showSuccessToast('Withdrawal Successful', {
        message: '✅ Funds withdrawn to your address!',
        hash: withdrawHash,
        autoHide: true,
        duration: 5000,
        onDismiss: () => {
          setWithdrawAddress('');
          setTxHash(undefined);
          setWithdrawError(null);
          onWithdrawSuccess?.();
          // Refresh page after 2 seconds
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
      });
    }
  }, [isConfirmed, withdrawHash, toastId, showSuccessToast, onWithdrawSuccess]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError?.message || 'Failed to initiate withdrawal';
      setWithdrawError(errorMessage);
      showErrorToast('Withdrawal Failed', {
        message: errorMessage,
        autoHide: true,
        duration: 5000,
      });
      console.error('Write error:', writeError);
    }
  }, [writeError, showErrorToast]);

  // Handle confirmation errors
  useEffect(() => {
    if (confirmError) {
      const errorMessage = confirmError?.message || 'Transaction failed to confirm';
      setWithdrawError(errorMessage);
      showErrorToast('Confirmation Failed', {
        message: errorMessage,
        autoHide: true,
        duration: 5000,
      });
      console.error('Confirm error:', confirmError);
    }
  }, [confirmError, showErrorToast]);

  return (
    <div className="claim-withdraw-section">
      <h4>Withdraw Claimed Balance</h4>
      <p className="claim-withdraw-description">
        Send your claimed balance to a wallet address
      </p>
      <div className="claim-withdraw-input-group">
        <AddressInput
          value={withdrawAddress}
          onChange={setWithdrawAddress}
          className="claim-withdraw-input"
          disabled={isWithdrawPending || isConfirming}
        />
        <button
          onClick={handleWithdraw}
          disabled={!isConnected || !isAddress(withdrawAddress as `0x${string}`) || isWithdrawPending || isConfirming}
          className="claim-withdraw-button"
        >
          {isWithdrawPending ? 'Sending transaction...' : isConfirming ? 'Confirming...' : 'Withdraw All'}
        </button>
      </div>
    </div>
  );
}
