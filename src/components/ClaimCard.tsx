import {useEffect, useState} from "react";
import {useReadContract} from "wagmi";
import {donateConfig} from "@/generated";
import type {Abi} from "viem";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext";
import {ClaimGuide} from "@/components/ClaimGuide";

interface ClaimCardProps {
  contractAddress: `0x${string}` | undefined;
}

interface ArtistData {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
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
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [isLoadingArtist, setIsLoadingArtist] = useState(false);
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
      setArtistData(null);
    }
  }, [artistUrl]);

  // Fetch artist data when artist ID is parsed
  useEffect(() => {
    if (!parsedArtistId) {
      setArtistData(null);
      return;
    }

    setIsLoadingArtist(true);
    fetch(`/api/artist?artistUrl=${encodeURIComponent(artistUrl.trim())}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch artist data');
        }
        return res.json();
      })
      .then((data: ArtistData) => {
        setArtistData(data);
      })
      .catch((error) => {
        console.error('Error fetching artist data:', error);
        setArtistData(null);
      })
      .finally(() => {
        setIsLoadingArtist(false);
      });
  }, [parsedArtistId, artistUrl]);

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
        <CardTitle>Claim guide</CardTitle>
        <CardDescription>
          Follow these steps to verify your identity and claim your donations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected && parsedArtistId && artistBalance !== null && artistBalance > 0n && (
          <div className="w-full rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-600">
            ⚠️ Sign in to claim this artist balance
          </div>
        )}

        <ClaimGuide
          artistId={parsedArtistId || ""}
          artistUrl={artistUrl}
          contractAddress={contractAddress}
          artistBalance={artistBalance}
          artistData={artistData}
          isLoadingArtist={isLoadingArtist}
          isVerified={isVerified}
          isVerifying={isVerifying}
          verifyError={verifyError}
          artistClaimed={artistClaimed}
          onArtistUrlChange={setArtistUrl}
          onVerify={handleVerify}
          onClaimSuccess={handleClaimSuccess}
        />
      </CardContent>
    </Card>
  );
}
