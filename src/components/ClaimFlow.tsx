import {useEffect, useState} from "react";
import {useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "@/generated";
import type {Abi} from "viem";
import {Button} from "@/components/ui/button";
import {Check, ExternalLink, Loader2} from "lucide-react";
import {EXPLORER_BASE_URL} from "@/wagmi-config";

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
  const [showSuccess, setShowSuccess] = useState(false);

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
      setShowSuccess(true);
      // Call success handler to update parent state
      onClaimSuccess?.();
      // Keep success message visible for 3 seconds even after state updates
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, onClaimSuccess]);

  useEffect(() => {
    if (confirmError) {
      const errorMessage = confirmError?.message || 'Transaction failed to confirm';
      setClaimError(errorMessage);
      setIsClaiming(false);
    }
  }, [confirmError]);

  // Show success message even if already claimed (briefly after claim)
  if (artistClaimed && !showSuccess) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Claim Button */}
      {isVerified && !isConfirmed && !showSuccess && (
        <Button
          onClick={handleClaim}
          disabled={isClaiming || isClaimPending || isConfirming}
          className="w-full"
          variant="default"
        >
          {isClaimPending || isConfirming || isClaiming ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              {isClaimPending
                ? "Sending transaction..."
                : isConfirming
                  ? "Confirming..."
                  : "Processing..."}
            </>
          ) : (
            "Claim Artist Balance"
          )}
        </Button>
      )}

      {/* Loading State */}
      {(isClaimPending || isConfirming || isClaiming) && !isConfirmed && !showSuccess && (
        <div className="rounded-lg border border-primary/40 bg-primary/10 p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-semibold text-primary">
              {isClaimPending
                ? "Sending transaction to blockchain..."
                : isConfirming
                  ? "Waiting for transaction confirmation..."
                  : "Processing your claim..."}
            </span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {(isConfirmed || showSuccess) && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600">
              Successfully claimed! You can now withdraw your balance.
            </span>
          </div>
        </div>
      )}

      {/* Claim Error */}
      {claimError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {claimError}
        </div>
      )}

      {/* Live Transaction Status */}
      {txHash && !claimError && (
        <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Waiting for confirmation...
                  </span>
                </>
              ) : isConfirmed ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600">
                    Transaction confirmed
                  </span>
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Transaction submitted
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">
                {txHash.slice(0, 6)}...{txHash.slice(-4)}
              </span>
              <a
                href={`${EXPLORER_BASE_URL}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                View on Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

