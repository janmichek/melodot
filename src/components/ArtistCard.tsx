import {BalanceLabel} from "@/components/ui/balance-label"
import type {ArtistCardProps} from "@types"
import {Spinner} from "@/components/ui/spinner"
import {Card, CardContent} from "@/components/ui/card"

export function ArtistCard({
  artistBalance,
  isArtistClaimed,
  artistData,
  isLoadingArtist = false,
}: ArtistCardProps) {
  const statusBadgeClasses = isArtistClaimed
    ? "rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-500"
    : "rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600"

  const artistImage = artistData?.images?.[0]?.url
  const artistName = artistData?.name

  return (
    <Card>
      <CardContent className="pt-5">
        {isLoadingArtist ? (
          <Spinner />
        ) : (
          <div className="flex items-center gap-3">
            {artistImage && (
              <img
                src={artistImage}
                alt={artistName}
                className="h-16 w-16 rounded-full object-cover"/>
            )}
            <div className="flex-1 space-y-1">
              <h4 className="text-base font-semibold text-foreground">
                {artistName}
              </h4>
              <div className="flex items-center gap-2">
                <BalanceLabel
                  balance={artistBalance}
                  showSymbol={true}
                  size="small"/>
                <span className={statusBadgeClasses}>
                  {isArtistClaimed ? "✓ Claimed" : "○ Available to Claim"}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

