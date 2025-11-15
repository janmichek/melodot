import {ArtistWithdrawForm} from "./ArtistWithdrawForm";
import {BalanceDisplay} from "./ui/balance-display";

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
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

