// @ts-check

import {useEffect, useState} from "react";
import {useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "../generated";
import {ArtistWithdrawForm} from "./ArtistWithdrawForm";
import {BalanceDisplay} from "./ui/balance-display";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {useWeb3AuthContext} from "../App";

/**
 * @param {{contractAddress?: string}} props
 */
export function ClaimCard({ contractAddress }) {
  const { isConnected } = useWeb3AuthContext();
  const [manualArtistId, setManualArtistId] = useState('');
  const [artistBalance, setArtistBalance] = useState(/** @type {bigint|null} */ (null));
  const [artistClaimed, setArtistClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState(/** @type {string|null} */ (null));

  const { data: artistInfoData, refetch } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi,
    functionName: 'getArtistInfo',
    args: manualArtistId ? [manualArtistId] : undefined,
  });

  const [txHash, setTxHash] = useState(/** @type {string|undefined} */ (undefined));

  const { writeContract, isPending: isClaimPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleClaimArtist = async () => {
    if (!manualArtistId || !contractAddress) {
      setClaimError('Artist ID is required');
      return;
    }

    setIsClaiming(true);
    setClaimError(null);
    setTxHash(undefined);

    try {
      const hash = await writeContract({
        address: contractAddress,
        abi: donateConfig.abi,
        functionName: 'claimArtist',
        args: [manualArtistId],
      });
      if (hash !== undefined) {
        setTxHash(hash);
      } else {
        setIsClaiming(false);
      }
    } catch (error) {
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
      void refetch();
    }
  }, [isConfirmed, refetch]);

  useEffect(() => {
    if (confirmError) {
      const errorMessage = confirmError?.message || 'Transaction failed to confirm';
      setClaimError(errorMessage);
      setIsClaiming(false);
    }
  }, [confirmError]);

  useEffect(() => {
    if (artistInfoData !== undefined) {
      const [balance, isClaimed] = /** @type {[bigint, boolean]} */ (artistInfoData);
      setArtistBalance(balance);
      setArtistClaimed(isClaimed);
    }
  }, [artistInfoData]);

  const statusBadgeClasses = artistClaimed
    ? "rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-500"
    : "rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Artist Verification</CardTitle>
        <CardDescription>
          Enter your Spotify Artist ID to check your balance and claim status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input
          type="text"
          placeholder="Enter Spotify Artist ID (e.g., 1234567890)"
          value={manualArtistId}
          onChange={(e) => setManualArtistId(e.target.value)}
        />

        {manualArtistId && (
          <div className="space-y-4 rounded-lg border border-border/40 bg-muted/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Artist Information
              </h3>
              <span className={statusBadgeClasses}>
                {artistClaimed ? "✓ Already Claimed" : "○ Available to Claim"}
              </span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2 text-foreground">
                <strong className="font-semibold">Artist ID:</strong>
                <span className="font-mono">{manualArtistId}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-foreground">
                <strong className="font-semibold">Spotify Profile:</strong>
                <a
                  href={`https://open.spotify.com/artist/${manualArtistId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View on Spotify
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <strong className="text-sm font-semibold text-foreground">
                  Balance:
                </strong>
                {artistBalance !== null ? (
                  <BalanceDisplay
                    balance={artistBalance}
                    showSymbol={true}
                    size="small"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">Loading...</span>
                )}
              </div>
              {artistBalance === 0n && (
                <p className="text-sm text-muted-foreground">
                  ℹ️ No donations found for this artist ID
                </p>
              )}
            </div>

            {artistClaimed && contractAddress && manualArtistId && (
              <ArtistWithdrawForm
                contractAddress={contractAddress}
                artistId={manualArtistId}
              />
            )}
          </div>
        )}
      </CardContent>
      {manualArtistId && !artistClaimed && artistBalance !== null && artistBalance > 0n && (
        <CardFooter className="flex flex-col gap-4">
          {!isConnected ? (
            <div className="w-full rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-600">
              ⚠️ Connect your wallet to claim this artist balance
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3">
              <Button
                onClick={handleClaimArtist}
                disabled={isClaiming || isClaimPending || isConfirming}
                className="w-full sm:w-auto"
              >
                {isClaimPending
                  ? "Sending transaction..."
                  : isConfirming
                  ? "Confirming..."
                  : isClaiming
                  ? "Processing..."
                  : "Claim Artist Balance"}
              </Button>
              {claimError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {claimError}
                </div>
              )}
              {txHash && !claimError && (
                <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                  Transaction submitted: {txHash.slice(0, 10)}...
                </div>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
