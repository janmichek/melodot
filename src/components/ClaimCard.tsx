import {useEffect, useState} from "react";
import {useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "../generated";
import {ArtistWithdrawForm} from "./ArtistWithdrawForm";
import {BalanceDisplay} from "./ui/balance-display";
import type {Abi} from "viem";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useWeb3AuthContext} from "../App";

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);

  // Parse artist ID when URL changes
  useEffect(() => {
    if (artistUrl.trim()) {
      const artistId = parseArtistIdFromUrl(artistUrl.trim());
      setParsedArtistId(artistId);
      // Reset verification state when artist ID changes
      setIsVerified(false);
      setVerifyError(null);
    } else {
      setParsedArtistId(null);
      setIsVerified(false);
      setVerifyError(null);
    }
  }, [artistUrl]);


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

  const handleVerify = async () => {
    if (!parsedArtistId) {
      setVerifyError('Valid Spotify artist URL is required');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);
    setIsVerified(false);

    try {
      const verifyResponse = await fetch(`/api/verify?artistId=${encodeURIComponent(parsedArtistId)}`);
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        setVerifyError(errorData.error || 'Failed to verify artist');
        setIsVerified(false);
        return;
      }

      const verifyData = await verifyResponse.json();
      if (!verifyData.verified) {
        setVerifyError(verifyData.message || 'Verification code not found in artist bio. Please add #8 to your Spotify artist bio.');
        setIsVerified(false);
        return;
      }

      // Verification successful
      setIsVerified(true);
      setVerifyError(null);
    } catch (error: any) {
      setVerifyError(error instanceof Error ? error.message : 'Failed to verify artist');
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClaim = async () => {
    if (!parsedArtistId || !contractAddress) {
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
      setIsVerified(false); // Reset verification after successful claim
      setShowClaimSuccess(true); // Show success message immediately
      
      // Refetch to update the claimed status
      void refetch().then(() => {
        // Hide success message after a delay, but keep the badge updated
        setTimeout(() => {
          setShowClaimSuccess(false);
        }, 5000);
      });
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

  useEffect(() => {
    if (isCodeCopied) {
      const timer = setTimeout(() => setIsCodeCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCodeCopied]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText('#8');
      setIsCodeCopied(true);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

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
        
        {parsedArtistId && artistBalance !== null && artistBalance > 0n && (
          <>
            {!isConnected ? (
              <div className="w-full rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-600">
                ⚠️ Connect your wallet to claim this artist balance
              </div>
            ) : (
              <div className="flex w-full flex-col gap-3">
                {/* Verification Instructions */}
                {!isVerified && !artistClaimed && (
              <div className="rounded-lg border border-border/40 bg-muted/10 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Verification Instructions</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>
                    Copy this code:{' '}
                    <code className="px-2 py-1 rounded bg-background border border-border font-mono text-foreground">#8</code>
                    {' '}
                    <button
                      onClick={handleCopyCode}
                      className="px-2 py-1 text-xs rounded border border-border hover:bg-muted transition-colors"
                      title="Copy code"
                    >
                      {isCodeCopied ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </li>
                  <li>
                    Go to your{' '}
                    <a
                      href={`https://artists.spotify.com/c/artist/${parsedArtistId}/profile/about`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Spotify artist profile
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
                  </li>
                  <li>Paste the code to your artist bio's about section</li>
                  <li>Come back and click 'Verify' below</li>
                </ol>
              </div>
            )}

            {/* Verification Status */}
            {isVerified && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-500"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="text-sm font-semibold text-emerald-600">
                    Verification successful! You can now claim your artist balance.
                  </span>
                </div>
              </div>
            )}

            {/* Verify Button */}
            {!isVerified && !artistClaimed && (
              <Button
                onClick={handleVerify}
                disabled={isVerifying || !parsedArtistId}
                className="w-full"
                variant="default"
              >
                {isVerifying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify Bio'
                )}
              </Button>
            )}

            {/* Verify Error */}
            {verifyError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {verifyError}
              </div>
            )}

            {/* Claim Button */}
            {isVerified && !artistClaimed && (
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
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
