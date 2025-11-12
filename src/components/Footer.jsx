// @ts-check

import {useEffect, useState} from "react";
import {usePublicClient, useReadContract} from "wagmi";
import {donateConfig} from "../generated";
import {formatAddress, passetHub} from "../wagmi-config";
import {BalanceDisplay} from "./ui/balance-display";
import {Button} from "@/components/ui/button";

/**
 * @param {{count: bigint, contractAddress: string}} props
 */
function ArtistsList({ count, contractAddress }) {
  /** @type {[Array<{id: string, totalBalance: bigint, isClaimed: boolean}>, (value: Array<{id: string, totalBalance: bigint, isClaimed: boolean}>) => void]} */
  const [artistItems, setArtistItems] = useState([]);
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
              abi: donateConfig.abi,
              functionName: "artistIds",
              args: [i],
            })
          );
        }

        const artistIds = /** @type {string[]} */ (await Promise.all(idPromises));

        // Fetch data for each artist
        const dataPromises = artistIds.map((artistId) =>
          publicClient.readContract({
            address: contractAddress,
            abi: donateConfig.abi,
            functionName: "artists",
            args: [artistId],
          })
        );

        const artistDataResults = await Promise.all(dataPromises);

        // Map to artist items
        const items = artistIds.map((artistId, index) => {
          const [totalBalance, isClaimed] = /** @type {[bigint, boolean]} */ (
            artistDataResults[index]
          );
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
    <div className="space-y-4 rounded-lg border border-border/40 bg-muted/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          All Artists in Contract ({count.toString()})
        </h3>
        <span className="text-xs text-muted-foreground">
          Updated in real-time
        </span>
      </div>
      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading artists...</p>
      )}
      {!isLoading && artistItems.length === 0 && (
        <p className="text-sm text-muted-foreground">No artists found</p>
      )}
      <div className="grid gap-3">
        {artistItems.map((artist) => (
          <div
            key={artist.id}
            className="space-y-3 rounded-md border border-border/30 bg-background/80 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Artist:{" "}
                <span className="font-mono text-xs text-muted-foreground">
                  {artist.id}
                </span>
              </p>
              <span
                className={
                  artist.isClaimed
                    ? "rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-500"
                    : "rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600"
                }
              >
                {artist.isClaimed ? "✓ Claimed" : "○ Available"}
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

export function Footer({ contractAddress }: ContractInfoFooterProps) {
  const [isArtistsExpanded, setIsArtistsExpanded] = useState(false);

  const { data: count } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi,
    functionName: "getArtistsCount",
  });

  const { data: balance } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi,
    functionName: "balance",
  });

  const artistCount = count ? Number(count) : 0;
  const platformBalance = typeof balance === "bigint" ? balance : undefined;

  return (
    <footer
      className="flex flex-col gap-4 rounded-xl border border-border bg-muted/5 p-4 text-sm text-muted-foreground"
      data-testid="footer"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">{passetHub.name}</span>
        <span>•</span>
        <a
          href={`${passetHub.blockExplorers.default.url}/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          {formatAddress(contractAddress, 6, 4)}
        </a>
        <span>•</span>
        {artistCount > 0 ? (
          <Button
            onClick={() => setIsArtistsExpanded((prev) => !prev)}
            variant="ghost"
            size="sm"
            className="h-8 px-3"
          >
            {artistCount} artists {isArtistsExpanded ? "▼" : "▲"}
          </Button>
        ) : (
          <span>{artistCount} artists</span>
        )}
        <span>•</span>
        <BalanceDisplay balance={platformBalance} showSymbol={true} size="small" />
      </div>

      {artistCount > 0 && isArtistsExpanded && (
        <ArtistsList count={BigInt(artistCount)} contractAddress={contractAddress} />
      )}
    </footer>
  );
}
