import {BalanceDisplay} from "@/components/ui/balance-display";
import type {ArtistData} from "@/types";

interface ArtistInfoProps {
  artistId: string;
  artistBalance: bigint;
  artistClaimed: boolean;
  contractAddress?: `0x${string}`;
  artistData?: ArtistData | null;
  isLoadingArtist?: boolean;
}

export function ArtistInfo({
  artistId,
  artistBalance,
  artistClaimed,
  contractAddress,
  artistData,
  isLoadingArtist = false,
}: ArtistInfoProps) {
  const statusBadgeClasses = artistClaimed
    ? "rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-500"
    : "rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600";

  const artistImage = artistData?.images?.[0]?.url;
  const artistName = artistData?.name;

  return (
    <div className="space-y-4 rounded-lg border border-border/40 bg-muted/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Artist Information
        </h3>
      </div>
      
      {isLoadingArtist ? (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div className="space-y-1">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : artistData && (artistImage || artistName) ? (
        <div className="flex items-center gap-3">
          {artistImage && (
            <img
              src={artistImage}
              alt={artistName || artistId}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          <div className="flex-1 space-y-1">
            {artistName && (
              <h4 className="text-base font-semibold text-foreground">
                {artistName}
              </h4>
            )}
            <div className="flex items-center gap-2">
              <BalanceDisplay
                balance={artistBalance}
                showSymbol={true}
                size="small"
              />
              <span className={statusBadgeClasses}>
                {artistClaimed ? "✓ Already Claimed" : "○ Available to Claim"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2 text-foreground">
            <strong className="font-semibold">Artist ID:</strong>
            <span className="font-mono">{artistId}</span>
          </div>
          <div className="flex items-center gap-2">
            <BalanceDisplay
              balance={artistBalance}
              showSymbol={true}
              size="small"
            />
            <span className={statusBadgeClasses}>
              {artistClaimed ? "✓ Already Claimed" : "○ Available to Claim"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

