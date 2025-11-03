import { useState, useEffect } from "react";
import { usePublicClient, useReadContract } from "wagmi";
import type { Abi } from "viem";
import { donateConfig } from "../generated";
import { BalanceDisplay } from "./ui/BalanceDisplay";

interface ArtistsListProps {
  count: bigint;
  contractAddress: `0x${string}`;
}

interface ArtistItem {
  id: string;
  totalBalance: bigint;
  isClaimed: boolean;
}

export function ArtistsList({ count, contractAddress }: ArtistsListProps) {
  const [artistItems, setArtistItems] = useState<ArtistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!publicClient || count === 0n) {
        setArtistItems([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all artist IDs
        const idPromises = [];
        for (let i = 0; i < Number(count); i++) {
          idPromises.push(
            publicClient.readContract({
              address: contractAddress,
              abi: donateConfig.abi as Abi,
              functionName: "artistIds",
              args: [i],
            })
          );
        }

        const artistIds = await Promise.all(idPromises);

        // Fetch data for each artist
        const dataPromises = (artistIds as string[]).map((artistId) =>
          publicClient.readContract({
            address: contractAddress,
            abi: donateConfig.abi as Abi,
            functionName: "artists",
            args: [artistId],
          })
        );

        const artistDataResults = await Promise.all(dataPromises);

        // Map to artist items
        const items = (artistIds as string[]).map((artistId, index) => {
          const [totalBalance, isClaimed] = artistDataResults[index] as [bigint, boolean];
          return {
            id: artistId,
            totalBalance,
            isClaimed,
          };
        });

        setArtistItems(items);
      } catch (error) {
        console.error("Failed to fetch artist data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [count, publicClient, contractAddress]);

  return (
    <div className="artists-list-section">
      <h3 className="artists-list-title">
        All Artists in Contract ({count.toString()})
      </h3>
      {isLoading && <p className="p-text">Loading artists...</p>}
      {!isLoading && artistItems.length === 0 && (
        <p className="p-text">No artists found</p>
      )}
      <div className="artists-list-container">
        {artistItems.map((artist) => (
          <div key={artist.id} className="artist-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <p style={{ margin: 0 }}>Artist: {artist.id}</p>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "3px",
                  backgroundColor: artist.isClaimed ? "#4CAF50" : "#FF9800",
                  color: "white",
                }}
              >
                {artist.isClaimed ? "✓ CLAIMED" : "○ AVAILABLE"}
              </span>
            </div>
            <BalanceDisplay
              balance={artist.totalBalance}
              label="Balance"
              showSymbol={true}
              size="small"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
