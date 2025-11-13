import {useEffect, useState} from "react";
import {usePublicClient, useReadContract} from "wagmi";
import type {Abi} from "viem";
import {donateConfig} from "../generated";
import {BalanceDisplay} from "./ui/balance-display";
import {DonationsTable} from "./DonationsTable";
import {DonationTransactions} from "./DonationTransactions";

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

  return (
    <div className="space-y-4 rounded-lg border border-border/40 bg-muted/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Artists in Contract ({count.toString()})
        </h3>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading artists...</p>}
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

interface DonationsListProps {
  contractAddress: `0x${string}`;
}

export function DonationsList({ contractAddress }: DonationsListProps) {
  const { data: count } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "getArtistsCount",
  });

  const artistCount = count ? Number(count) : 0;

  return (
    <section
      className="flex flex-col gap-4 rounded-xl border border-border bg-muted/5 p-4 text-sm text-muted-foreground"
      data-testid="donations-list"
    >
      {/* Donation Transactions - Shows all transactions with donor addresses */}
      <DonationTransactions contractAddress={contractAddress} />
      
      {artistCount > 0 && (
        <>
          <DonationsTable contractAddress={contractAddress} />
          <ArtistsList count={BigInt(artistCount)} contractAddress={contractAddress} />
        </>
      )}
    </section>
  );
}



