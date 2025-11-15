import {ArtistWithdrawForm} from "@/components/ArtistWithdrawForm";
import {BalanceDisplay} from "@/components/ui/balance-display";
import {ExternalLink} from "lucide-react";

interface ArtistInfoProps {
  artistId: string;
  artistBalance: bigint;
  artistClaimed: boolean;
  contractAddress?: `0x${string}`;
}

export function ArtistInfo({
  artistId,
  artistBalance,
  artistClaimed,
  contractAddress,
}: ArtistInfoProps) {
  const statusBadgeClasses = artistClaimed
    ? "rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-500"
    : "rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600";

  return (
    <div className="space-y-4 rounded-lg border border-border/40 bg-muted/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Artist Information
        </h3>
        <span className={statusBadgeClasses}>
          {artistClaimed ? "✓ Already Claimed" : "○ Available to Claim"}
        </span>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2 text-foreground">
          <strong className="font-semibold">Artist ID:</strong>
          <span className="font-mono">{artistId}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-foreground">
          <strong className="font-semibold">Spotify Profile:</strong>
          <a
            href={`https://open.spotify.com/artist/${artistId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            View on Spotify
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <div className="space-y-2">
        <div className="space-y-1">
          <strong className="text-sm font-semibold text-foreground">
            Balance:
          </strong>
          <BalanceDisplay
            balance={artistBalance}
            showSymbol={true}
            size="small"
          />
        </div>
      </div>

      {artistClaimed && contractAddress && (
        <ArtistWithdrawForm
          contractAddress={contractAddress}
          artistId={artistId}
        />
      )}
    </div>
  );
}

