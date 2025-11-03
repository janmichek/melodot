import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { donateConfig } from "../generated";
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
  const { isConnected } = useAccount();

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

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError?.message || 'Failed to initiate withdrawal';
      setWithdrawError(errorMessage);
      console.error('Write error:', writeError);
    }
  }, [writeError]);

  // Handle confirmation errors
  useEffect(() => {
    if (confirmError) {
      const errorMessage = confirmError?.message || 'Transaction failed to confirm';
      setWithdrawError(errorMessage);
      console.error('Confirm error:', confirmError);
    }
  }, [confirmError]);

  // Handle successful confirmation
  useEffect(() => {
    if (isConfirmed) {
      console.log('Withdrawal confirmed successfully');
      setWithdrawAddress('');
      setTxHash(undefined);
      setWithdrawError(null);
      onWithdrawSuccess?.();
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [isConfirmed, onWithdrawSuccess]);

  return (
    <div className="claim-withdraw-section">
      <h4>Withdraw Claimed Balance</h4>
      <p className="claim-withdraw-description">
        Send your claimed balance to a wallet address
      </p>
      <div className="claim-withdraw-input-group">
        <input
          type="text"
          placeholder="Enter recipient address (0x...)"
          value={withdrawAddress}
          onChange={(e) => setWithdrawAddress(e.target.value)}
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

        {txHash && !withdrawError && (
          <div className={`tx-status-box ${isConfirmed ? 'tx-status-success' : 'tx-status-pending'}`}>
            {isConfirming && <p>⏳ Waiting for confirmation...</p>}
            {isConfirmed && <p className="tx-status-text">✅ Withdrawal successful!</p>}
            <p className="tx-hash">Tx: {txHash.slice(0, 10)}...</p>
          </div>
        )}

        {withdrawError && (
          <div className="claim-withdraw-error">
            {withdrawError}
          </div>
        )}
        {!isAddress(withdrawAddress as `0x${string}`) && withdrawAddress && (
          <p className="claim-invalid-address">
            ❌ Invalid address
          </p>
        )}
      </div>
    </div>
  );
}
