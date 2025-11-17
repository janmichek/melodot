import {CheckButton} from "@/components/ui/check-button"
import type {DonationArtistControlsProps} from "@types"

export function DonationArtistsControls({
  artists,
  selectedArtists,
  onToggleArtist,
  isDisabled = false,
}: DonationArtistControlsProps) {
  // Only show if there's more than one artist
  if (artists.length <= 1) {
    return null
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground/80">
        Select artists to donate to
      </label>
      <div className="flex flex-wrap gap-2">
        {artists.map((artist) => (
          <CheckButton
            key={artist.id}
            id={`artist-${artist.id}`}
            checked={selectedArtists.has(artist.id)}
            onChange={() => onToggleArtist(artist.id)}
            disabled={isDisabled}>
            {artist.name}
          </CheckButton>
        ))}
      </div>
    </div>
  )
}

