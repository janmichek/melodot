import {useReadContract} from "wagmi";
import {donateConfig} from "../generated";
import {formatPasBalance, CURRENCY_SYMBOL} from "../wagmi-config";
import type {Abi} from "viem";

interface ArtistCardProps {
  artistId: string;
  contractAddress: `0x${string}`;
}

export function ArtistCard({artistId, contractAddress}: ArtistCardProps) {
  const {data: artistData, isLoading} = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "artists",
    args: [artistId],
  });

  if (isLoading) {
    return <p className="p-text">Loading artist {artistId}...</p>;
  }

  if (!artistData) {
    return <p className="p-text">No data found for artist {artistId}</p>;
  }

  const [totalBalance, isClaimed] = artistData as [bigint, boolean];

  return (
    <div className="artist-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <p style={{ margin: 0 }}>Artist: {artistId}</p>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 'bold',
          padding: '0.25rem 0.5rem',
          borderRadius: '3px',
          backgroundColor: isClaimed ? '#4CAF50' : '#FF9800',
          color: 'white'
        }}>
          {isClaimed ? '✓ CLAIMED' : '○ AVAILABLE'}
        </span>
      </div>
      <p style={{ margin: '0.5rem 0 0 0' }}>Balance: {formatPasBalance(totalBalance)} {CURRENCY_SYMBOL}</p>
    </div>
  );
}
