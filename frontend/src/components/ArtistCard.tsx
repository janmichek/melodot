import { useReadContract } from "wagmi";
import { donateConfig } from "../generated";
import type { Abi } from "viem";

interface ArtistCardProps {
  artistIndex: number;
  contractAddress: `0x${string}`;
}

export function ArtistCard({ artistIndex, contractAddress }: ArtistCardProps) {

  const { data: artistData, isLoading } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "artists",
    args: [artistIndex],
  });

  if (isLoading) {
    return <p className="p-text">Loading artist #{artistIndex}...</p>;
  }

  if (!artistData) {
    return <p className="p-text">No data found for artist #{artistIndex}</p>;
  }
  console.log('artistData', artistData)
  const [musicId, balance, isClaimed] = artistData as [string, bigint, boolean];

  return (
    <div className="artist-card">
      <div className="artist-card-header">
        <div className="artist-card-content">
          <p className="artist-card-label">Artist #{artistIndex} - Music ID</p>
          <p className="artist-card-value">{musicId}</p>
        </div>
        {isClaimed && <span className="badge-claimed">CLAIMED</span>}
      </div>
      <div>
        <p className="artist-card-label">Balance</p>
        <p className="artist-card-balance">{Number(balance) / 1e18} PAS</p>
      </div>
    </div>
  );
}
