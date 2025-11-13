import {useEffect, useState} from "react";
import {usePublicClient, useReadContract} from "wagmi";
import type {Abi} from "viem";
import {donateConfig} from "../generated";
import {formatAddress, passetHub} from "../wagmi-config";
import {BalanceDisplay} from "./ui/balance-display";

interface ArtistItem {
  id: string;
  totalBalance: bigint;
  isClaimed: boolean;
}

function ArtistsList({ count, contractAddress }: { count: bigint; contractAddress: `0x${string}` }) {
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
        const idPromises = [];
        for (let i = 0; i < Number(count); i++) {
          idPromises.push(
            publicClient.readContract({
              address: contractAddress,
              abi: donateConfig.abi as Abi,
              functionName: "artistIds",
              args: [i],
            }),
          );
        }

        const artistIds = await Promise.all(idPromises);

        const dataPromises = (artistIds as string[]).map((artistId) =>
          publicClient.readContract({
            address: contractAddress,
            abi: donateConfig.abi as Abi,
            functionName: "artists",
            args: [artistId],
          }),
        );

        const artistDataResults = await Promise.all(dataPromises);

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

  const hasArtists = artistItems.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Artists ({count.toString()})
        </h3>
        <span className="text-xs text-muted-foreground">Auto-refresh</span>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading artists…</p>}
      {!isLoading && !hasArtists && (
        <p className="text-sm text-muted-foreground">No artists yet.</p>
      )}
      {!isLoading && hasArtists && (
        <ul className="space-y-2">
          {artistItems.map((artist) => (
            <li key={artist.id} className="rounded border border-border/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-muted-foreground">{artist.id}</span>
                <span className={artist.isClaimed ? "text-emerald-600" : "text-amber-600"}>
                  {artist.isClaimed ? "Claimed" : "Available"}
                </span>
              </div>
              <BalanceDisplay
                balance={artist.totalBalance}
                label="Balance"
                showSymbol={true}
                size="small"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface DonationsListProps {
  contractAddress: `0x${string}`;
}

export function DonationsList({ contractAddress }: DonationsListProps) {
  const [isArtistsExpanded, setIsArtistsExpanded] = useState(true);

  const { data: count } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "getArtistsCount",
  });

  const { data: balance } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "balance",
  });

  const artistCount = count ? Number(count) : 0;
  const platformBalance = typeof balance === "bigint" ? balance : undefined;

  return (
    <section
      className="space-y-3 rounded border border-border/60 p-4 text-sm text-muted-foreground"
      data-testid="donations-list"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium text-foreground">{passetHub.name}</span>
        <a
          href={`${passetHub.blockExplorers.default.url}/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 hover:underline"
        >
          {formatAddress(contractAddress, 6, 4)}
        </a>
        <BalanceDisplay balance={platformBalance} showSymbol={true} size="small" />
        {artistCount > 0 ? (
          <button
            type="button"
            onClick={() => setIsArtistsExpanded((prev) => !prev)}
            className="text-xs font-medium text-primary"
          >
            {artistCount} artists {isArtistsExpanded ? "▾" : "▴"}
          </button>
        ) : (
          <span>{artistCount} artists</span>
        )}
      </div>

      {artistCount > 0 && isArtistsExpanded && (
        <ArtistsList count={BigInt(artistCount)} contractAddress={contractAddress} />
      )}
    </section>
  );
}



