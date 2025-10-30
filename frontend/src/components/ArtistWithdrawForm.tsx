import { useState } from "react";
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
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { isConnected } = useAccount();

  const { writeContract: withdrawWriteContract, isPending: isWithdrawPending } = useWriteContract();

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

    setIsWithdrawing(true);
    setWithdrawError(null);

    try {
      withdrawWriteContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: 'withdrawDonate',
        args: [artistId, withdrawAddress as `0x${string}`],
        gas: BigInt(300000), // Fixed gas limit to avoid gas estimation issues
      });

      // Clear form on success
      if (!isWithdrawPending) {
        setTimeout(() => {
          setWithdrawAddress('');
          onWithdrawSuccess?.();
        }, 1000);
      }
    } catch (error: any) {
      setWithdrawError(error?.message || 'Failed to withdraw');
      setIsWithdrawing(false);
    }
  };

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
        />
        <button
          onClick={handleWithdraw}
          disabled={!isConnected || !isAddress(withdrawAddress as `0x${string}`) || isWithdrawing || isWithdrawPending}
          className="claim-withdraw-button"
        >
          {isWithdrawing || isWithdrawPending ? 'Withdrawing...' : 'Withdraw All'}
        </button>
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
