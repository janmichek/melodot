import { useReadContract } from "wagmi";
import { donateConfig } from "../generated";
import type { Abi } from "viem";

interface ArtistsListProps {
  count: bigint;
  contractAddress: `0x${string}`;
}

export function ArtistsList({ count, contractAddress }: ArtistsListProps) {
  return (
    <div className="artists-list-section">
      <h3 className="artists-list-title">
        All Artists in Contract ({count.toString()})
      </h3>
      <div className="artists-list-container">
        {Array.from({ length: Number(count) }, (_, i) => (
          <AllArtistsCard
            key={i}
            artistIndex={i}
            contractAddress={contractAddress}
          />
        ))}
      </div>
    </div>
  );
}

function AllArtistsCard({
  artistIndex,
  contractAddress,
}: {
  artistIndex: number;
  contractAddress: `0x${string}`;
}) {
  const { data: artistData, isLoading } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "artists",
    args: [artistIndex],
  });

  if (isLoading) {
    return (
      <div className="artist-card">
        <p className="p-text">Loading artist #{artistIndex}...</p>
      </div>
    );
  }

  if (!artistData || !(artistData as any)[0]) {
    return (
      <div className="artist-card">
        <p className="p-text">No data found for artist #{artistIndex}</p>
      </div>
    );
  }

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
