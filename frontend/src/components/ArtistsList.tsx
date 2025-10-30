import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import type { Abi } from "viem";
import { donateConfig } from "../generated";
import { ArtistCard } from "./ArtistCard";

interface ArtistsListProps {
  count: bigint;
  contractAddress: `0x${string}`;
}

export function ArtistsList({ count, contractAddress }: ArtistsListProps) {
  const [artistIds, setArtistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();

  // Fetch all artist IDs from contract
  useEffect(() => {
    const fetchArtistIds = async () => {
      if (!publicClient || count === 0n) return;

      setIsLoading(true);
      try {
        const ids: string[] = [];
        const promises = [];

        // Create promises for all artistIds calls
        for (let i = 0; i < Number(count); i++) {
          promises.push(
            publicClient.readContract({
              address: contractAddress,
              abi: donateConfig.abi as Abi,
              functionName: "artistIds",
              args: [i],
            })
          );
        }

        const results = await Promise.all(promises);
        setArtistIds(results as string[]);
      } catch (error) {
        console.error("Failed to fetch artist IDs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistIds();
  }, [count, publicClient, contractAddress]);

  return (
    <div className="artists-list-section">
      <h3 className="artists-list-title">
        All Artists in Contract ({count.toString()})
      </h3>
      {isLoading && <p className="p-text">Loading artists...</p>}
      {!isLoading && artistIds.length === 0 && (
        <p className="p-text">No artists found</p>
      )}
      <div className="artists-list-container">
        {artistIds.map((artistId) => (
          <ArtistCard
            key={artistId}
            artistId={artistId}
            contractAddress={contractAddress}
          />
        ))}
      </div>
    </div>
  );
}
