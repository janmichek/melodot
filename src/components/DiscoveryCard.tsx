import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {ExternalLink} from "lucide-react"
import {DonationForm} from "@/components/DonationForm"
import spotifyIcon from "@/assets/icons/spotify.svg"
import type {DiscoveryCardProps} from "@types"

export default function DiscoveryCard({discovery, onDiscoverAgain}: DiscoveryCardProps) {
  const [donationSuccess, setDonationSuccess] = useState(false)
  if (!discovery || !discovery.track) {
    return (
      <Card className="backdrop-blur-sm bg-card/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No music recognized in this audio file.</p>
        </CardContent>
      </Card>
    )
  }

  const track = discovery.track

  const spotifyUri = track.hub?.actions?.find((action: { type: string; uri?: string }) => action.type === 'uri')?.uri

  // Use spotifyInfo artists if available, otherwise fall back to track.artists (Shazam data)
  
  const artists = discovery.spotifyInfo?.artists ?? []
  
  return (
    <Card className="discovery-enter discovery-success-pulse overflow-hidden backdrop-blur-sm bg-card/95 border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardHeader className="discovery-header">
        <CardTitle className="text-center flex items-center justify-center gap-2">
          Track Discovered!
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {track.images?.coverart && (
            <div className="discovery-album-art relative w-32 h-32 sm:w-48 sm:h-48 flex-shrink-0 mx-auto sm:mx-0 aspect-square">
              <img
                src={track.images.coverart}
                alt="Album cover"
                className="w-full h-full object-cover rounded-xl shadow-lg ring-1 ring-border/50"/>
            </div>
          )}

          <div className="flex flex-col justify-center flex-1 min-w-0 text-center sm:text-left">
            <div className="space-y-2">
              <h2 className="discovery-title text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {track.title}
              </h2>

              <p className="discovery-artist text-base sm:text-lg font-semibold text-foreground/90">
                {track.subtitle}
              </p>
            </div>


            {(artists.length > 0) && (
              <div className="mt-4 space-y-3">
                {spotifyUri && (
                  <Button
                    asChild
                    className="discovery-spotify-button w-full md:w-auto bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg">
                    <a
                      href={spotifyUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2">
                      <img src={spotifyIcon} alt="Spotify" className="h-5 w-5" />
                      Listen on Spotify
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}

                {/* Spotify Artist Links */}
                {artists.length > 0 && (
                  <div className="discovery-spotify-links flex flex-wrap gap-3 justify-center sm:justify-start">
                    {artists.map((artist: { id: string; name: string; url: string }) => (
                      <a
                        key={artist.id}
                        href={artist.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[#1DB954] hover:text-[#1ed760] underline underline-offset-4 hover:underline-offset-2 transition-all">
                        <img src={spotifyIcon} alt="Spotify" className="h-4 w-4" />
                        {artist.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Donation Section */}
        {artists.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="discovery-donation-section space-y-4">
              {donationSuccess ? (
                <div className="confetti-container flex justify-center py-8">
                  <h3 className="thank-you-text text-4xl font-bold text-green-500 flex items-center justify-center gap-3 text-center">
                    Thank You for Donation
                  </h3>
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                  <div className="confetti-piece" />
                </div>
              ) : (
                <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide flex items-center gap-2">
                  {artists.length === 1
                    ? "Donate to Artist"
                    : `Donate to ${artists.length} artists`}
                </h3>
              )}

              <div className="space-y-3">
                <DonationForm
                  artists={artists}
                  onSuccess={() => setDonationSuccess(true)}
                  onDiscoverAgain={onDiscoverAgain}/>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
