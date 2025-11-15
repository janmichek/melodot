import {useEffect, useState} from "react";
import {useReadContract} from "wagmi";
import {donateConfig} from "@/generated";
import type {Abi} from "viem";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext";
import {ArtistInfo} from "@/components/ArtistInfo";
import {VerificationFlow} from "@/components/VerificationFlow";
import {ClaimFlow} from "@/components/ClaimFlow";

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

  // Parse artist ID when URL changes
  useEffect(() => {
    if (artistUrl.trim()) {
      const artistId = parseArtistIdFromUrl(artistUrl.trim());
      setParsedArtistId(artistId);
    } else {
      setParsedArtistId(null);
    }
  }, [artistUrl]);

  // Reset verification state when artist ID changes
  useEffect(() => {
    setIsVerified(false);
    setVerifyError(null);
  }, [parsedArtistId]);


  const { data: artistInfoData, refetch } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: 'getArtistInfo',
    args: parsedArtistId ? [parsedArtistId] : undefined,
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

  const handleClaimSuccess = () => {
    setIsVerified(false); // Reset verification after successful claim
    void refetch();
  };

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
          <ArtistInfo
            artistId={parsedArtistId}
            artistBalance={artistBalance}
            artistClaimed={artistClaimed}
            contractAddress={contractAddress}
          />
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
                ⚠️ Sign in to claim this artist balance
              </div>
            ) : (
              <>
                {!artistClaimed && (
                  <VerificationFlow
                    artistId={parsedArtistId}
                    isVerified={isVerified}
                    isVerifying={isVerifying}
                    verifyError={verifyError}
                    onVerify={handleVerify}
                  />
                )}
                {contractAddress && (
                  <ClaimFlow
                    artistId={parsedArtistId}
                    contractAddress={contractAddress}
                    isVerified={isVerified}
                    artistClaimed={artistClaimed}
                    onClaimSuccess={handleClaimSuccess}
                  />
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
