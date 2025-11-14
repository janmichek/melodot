import {useEffect, useState} from "react";
import {useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "../generated";
import {ArtistWithdrawForm} from "./ArtistWithdrawForm";
import {BalanceDisplay} from "./ui/balance-display";
import type {Abi} from "viem";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {useWeb3AuthContext} from "../App";
import {useQuery} from "@tanstack/react-query";

interface ClaimCardProps {
  contractAddress: `0x${string}` | undefined;
}

// Parse artist ID from Spotify URL
function parseArtistIdFromUrl(url: string): string | null {
  try {
    // Match patterns like:
    // https://open.spotify.com/artist/6nS5roXSAGhTGr34W6n7Et?si=...
    // https://open.spotify.com/artist/6nS5roXSAGhTGr34W6n7Et
    // open.spotify.com/artist/6nS5roXSAGhTGr34W6n7Et
    const match = url.match(/artist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function ClaimCard({ contractAddress }: ClaimCardProps) {
  const { isConnected } = useWeb3AuthContext();
  const [artistUrl, setArtistUrl] = useState('');
  const [parsedArtistId, setParsedArtistId] = useState<string | null>(null);
  const [artistBalance, setArtistBalance] = useState<bigint | null>(null);
  const [artistClaimed, setArtistClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Parse artist ID when URL changes
  useEffect(() => {
    if (artistUrl.trim()) {
      const artistId = parseArtistIdFromUrl(artistUrl.trim());
      setParsedArtistId(artistId);
    } else {
      setParsedArtistId(null);
    }
  }, [artistUrl]);

  // Fetch artist biography when URL is pasted
  const { data: biographyData, isLoading: isLoadingBiography } = useQuery<{ biography?: string; status?: boolean; rawData?: any }>({
    queryKey: ['artist-biography', artistUrl],
    queryFn: async () => {
      if (!artistUrl.trim() || !artistUrl.includes('open.spotify.com/artist/')) {
        return null;
      }
      const response = await fetch(`/api/spotify/artist-biography?artistUrl=${encodeURIComponent(artistUrl.trim())}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch biography:', errorData);
        throw new Error(errorData.error || 'Failed to fetch biography');
      }
      const data = await response.json();
      console.log('Artist Biography Data:', data);
      return data;
    },
    enabled: !!artistUrl.trim() && artistUrl.includes('open.spotify.com/artist/'),
    retry: 1,
  });

  const { data: artistInfoData, refetch } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: 'getArtistInfo',
    args: parsedArtistId ? [parsedArtistId] : undefined,
  });

  const [txHash, setTxHash] = useState<string | undefined>();

  const { writeContract, isPending: isClaimPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  const handleClaimArtist = async () => {
    if (!parsedArtistId || !contractAddress) {
      setClaimError('Valid Spotify artist URL is required');
      return;
    }

    setIsClaiming(true);
    setClaimError(null);
    setTxHash(undefined);

    try {
      const hash = await writeContract({
        address: contractAddress as `0x${string}`,
        abi: donateConfig.abi as Abi,
        functionName: 'claimArtist',
        args: [parsedArtistId],
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
      const [balance, isClaimed] = artistInfoData as [bigint, boolean];
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
        <CardTitle>Artist Claiming</CardTitle>
        <CardDescription>
          Paste your Spotify artist URL to check donations and claim your balance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input
          type="text"
          placeholder="https://open.spotify.com/artist/..."
          value={artistUrl}
          onChange={(e) => setArtistUrl(e.target.value)}
        />

        {artistUrl && !parsedArtistId && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Invalid Spotify artist URL. Please paste a valid URL like: https://open.spotify.com/artist/...
          </div>
        )}

        {/* Artist Biography Section */}
        {isLoadingBiography && (
          <div className="rounded-lg border border-border/40 bg-muted/10 p-4 text-sm text-muted-foreground">
            Loading artist biography...
          </div>
        )}

        {biographyData?.biography && !isLoadingBiography && (
          <div className="space-y-2 rounded-lg border border-border/40 bg-muted/10 p-4">
            <h3 className="text-sm font-semibold text-foreground">Artist Biography</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {biographyData.biography}
            </p>
          </div>
        )}

        {parsedArtistId && artistBalance !== null && artistBalance === 0n && (
          <div className="rounded-lg border border-border/40 bg-muted/10 p-4 text-center text-sm text-muted-foreground">
            Not found
          </div>
        )}

        {parsedArtistId && artistBalance !== null && artistBalance > 0n && (
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
                <span className="font-mono">{parsedArtistId}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-foreground">
                <strong className="font-semibold">Spotify Profile:</strong>
                <a
                  href={`https://open.spotify.com/artist/${parsedArtistId}`}
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
                <BalanceDisplay
                  balance={artistBalance}
                  showSymbol={true}
                  size="small"
                />
              </div>
            </div>

            {artistClaimed && contractAddress && parsedArtistId && (
              <ArtistWithdrawForm
                contractAddress={contractAddress}
                artistId={parsedArtistId}
              />
            )}
          </div>
        )}

        {parsedArtistId && artistBalance === null && (
          <div className="rounded-lg border border-border/40 bg-muted/10 p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        )}
      </CardContent>
      {parsedArtistId && !artistClaimed && artistBalance !== null && artistBalance > 0n && (
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
