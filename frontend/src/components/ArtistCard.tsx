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

  const [musicId, balance, isClaimed] = artistData as [string, bigint, boolean];

  return (
    <div className="artist-card">
          <p>Artist #{artistIndex} - Music ID{musicId} </p>
          <p ></p>
        {isClaimed && <span className="badge-claimed">CLAIMED</span>}
        <p>Balance {(Number(balance) / 10 ** 10).toFixed(2)} PAS</p>
    </div>
  );
}
