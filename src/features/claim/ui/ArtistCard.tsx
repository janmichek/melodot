import {BalanceLabel} from "@/shared/ui/balance-label"
import type {ArtistCardProps} from "@types"
import {Spinner} from "@/shared/ui/spinner"

export function ArtistCard({
  artistBalance,
  isArtistClaimed,
  artistData,
  isLoadingArtist = false,
}: ArtistCardProps) {
  const artistImage = artistData?.images?.[0]?.url
  const artistName = artistData?.name

  return (
    <div className="paper-card flex items-center gap-4 p-4">
      {isLoadingArtist ? (
        <Spinner />
      ) : (
        <>
          {artistImage ? (
            <img
              src={artistImage}
              alt={artistName ?? "Artist"}
              className="h-16 w-16 rounded-full object-cover grayscale"/>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border/70 font-display text-2xl text-muted-foreground">
              ♪
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl leading-none">{artistName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <BalanceLabel balance={artistBalance} showSymbol={true} size="small" />
              <span
                className={
                  isArtistClaimed
                    ? "text-[10px] font-semibold uppercase tracking-[0.16em] text-acid"
                    : "text-[10px] font-semibold uppercase tracking-[0.16em] text-coral"
                }>
                {isArtistClaimed ? "Claimed" : "Available to claim"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
