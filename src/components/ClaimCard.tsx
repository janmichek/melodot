import {useEffect, useState} from "react";
import {useReadContract, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "../generated";
import {ArtistWithdrawForm} from "./ArtistWithdrawForm";
import {BalanceDisplay} from "./ui/BalanceDisplay";
import type {Abi} from "viem";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {useWeb3AuthContext} from "../App";

interface ClaimCardProps {
  contractAddress: `0x${string}` | undefined;
}

export function ClaimCard({ contractAddress }: ClaimCardProps) {
  const { isConnected } = useWeb3AuthContext();
  const [manualArtistId, setManualArtistId] = useState('');
  const [artistBalance, setArtistBalance] = useState<bigint | null>(null);
  const [artistClaimed, setArtistClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const { data: artistInfoData, refetch } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: 'getArtistInfo',
    args: manualArtistId ? [manualArtistId] : undefined,
  });

  const [txHash, setTxHash] = useState<string | undefined>();

  const { writeContract, isPending: isClaimPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
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
        address: contractAddress as `0x${string}`,
        abi: donateConfig.abi as Abi,
        functionName: 'claimArtist',
        args: [manualArtistId],
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Artist Verification</CardTitle>
        <CardDescription>
          Enter your Spotify Artist ID to check your balance and claim status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="claim-artist-input-group">
          <Input
            type="text"
            placeholder="Enter Spotify Artist ID (e.g., 1234567890)"
            value={manualArtistId}
            onChange={(e) => setManualArtistId(e.target.value)}
            className="claim-artist-input"
          />
        </div>

        {manualArtistId && (
          <div className="claim-artist-info-box mt-4">
            <h3 className="font-bold">Artist Information</h3>
            <p><strong>Artist ID:</strong> {manualArtistId}</p>
            <p>
              <strong>Balance:</strong>{' '}
              <span className="claim-artist-balance">
                {artistBalance !== null ? (
                  <BalanceDisplay balance={artistBalance} showSymbol={true} size="small" />
                ) : 'Loading...'}
              </span>
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`claim-artist-status ${artistClaimed ? 'claimed' : 'available'}`}>
                {artistClaimed ? '✓ Already Claimed' : '○ Available to Claim'}
              </span>
            </p>

            {artistBalance === 0n && (
              <p className="claim-no-balance-message text-sm text-muted-foreground">
                ℹ️ No donations found for this artist ID
              </p>
            )}

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
        <CardFooter className="flex-col items-start">
          {!isConnected ? (
            <div className="claim-wallet-warning text-yellow-500">
              ⚠️ Connect your wallet to claim this artist balance
            </div>
          ) : (
            <div className="claim-action-section">
              <Button
                onClick={handleClaimArtist}
                disabled={isClaiming || isClaimPending || isConfirming}
                className="claim-button"
              >
                {isClaimPending ? 'Sending transaction...' : isConfirming ? 'Confirming...' : isClaiming ? 'Processing...' : 'Claim Artist Balance'}
              </Button>
              {claimError && (
                <div className="text-red-500 mt-2">
                  {claimError}
                </div>
              )}
              {txHash && !claimError && (
                <div className="text-green-500 mt-2">
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
