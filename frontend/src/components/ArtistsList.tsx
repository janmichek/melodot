import { ArtistCard } from "./ArtistCard";

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
          <ArtistCard
            key={i}
            artistIndex={i}
            contractAddress={contractAddress}
          />
        ))}
      </div>
    </div>
  );
}
