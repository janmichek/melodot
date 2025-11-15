import {useEffect, useState} from "react";
import {useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "../generated";
import type {Abi} from "viem";
import {Button} from "@/components/ui/button";

interface ClaimFlowProps {
  artistId: string;
  contractAddress: `0x${string}`;
  isVerified: boolean;
  artistClaimed: boolean;
  onClaimSuccess?: () => void;
}

export function ClaimFlow({
  artistId,
  contractAddress,
  isVerified,
  artistClaimed,
  onClaimSuccess,
}: ClaimFlowProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();

  const {writeContract, isPending: isClaimPending} = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  const handleClaim = async () => {
    if (!artistId || !contractAddress) {
      setClaimError('Valid Spotify artist URL is required');
      return;
    }

    if (!isVerified) {
      setClaimError('Please verify your artist bio first');
      return;
    }

    setIsClaiming(true);
    setClaimError(null);
    setTxHash(undefined);

    try {
      const hash = await writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: 'claimArtist',
        args: [artistId],
      });
      if (hash !== undefined) {
        setTxHash(hash);
      } else {
        setIsClaiming(false);
      }
    } catch (error: any) {
      const errorMessage =
        error?.details?.errors?.[0]?.message ||
        error?.shortMessage ||
        error?.message ||
        error?.cause?.message ||
        'Failed to claim artist';
      setClaimError(errorMessage);
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setIsClaiming(false);
      setClaimError(null);
      setTxHash(undefined);
      onClaimSuccess?.();
    }
  }, [isConfirmed, onClaimSuccess]);

  useEffect(() => {
    if (confirmError) {
      const errorMessage = confirmError?.message || 'Transaction failed to confirm';
      setClaimError(errorMessage);
      setIsClaiming(false);
    }
  }, [confirmError]);

  // Don't render if already claimed
  if (artistClaimed) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Claim Button */}
      {isVerified && (
        <Button
          onClick={handleClaim}
          disabled={isClaiming || isClaimPending || isConfirming}
          className="w-full"
          variant="default"
        >
          {isClaimPending
            ? "Sending transaction..."
            : isConfirming
              ? "Confirming..."
              : isClaiming
                ? "Processing..."
                : "Claim Artist Balance"}
        </Button>
      )}

      {/* Claim Error */}
      {claimError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {claimError}
        </div>
      )}

      {/* Transaction Status */}
      {txHash && !claimError && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          Transaction submitted: {txHash.slice(0, 10)}...
        </div>
      )}
    </div>
  );
}

