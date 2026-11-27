import {useState} from "react"
import {Button} from "@/shared/ui/button"
import {Separator} from "@/shared/ui/separator"
import {ExternalLink} from "lucide-react"
import {DonationForm} from "@/features/donate"
import spotifyIcon from "@/shared/assets/icons/spotify.svg"
import type {DiscoveryCardProps} from "@types"

export default function DiscoveryCard({discovery, onDiscoverAgain}: DiscoveryCardProps) {
  const [donationSuccess, setDonationSuccess] = useState(false)
  if (!discovery || !discovery.track) {
    return (
      <div className="paper-card p-10 text-center text-muted-foreground">
        No music recognized in this audio file.
      </div>
    )
  }

  const track = discovery.track

  const spotifyUri =
    track.hub?.providers
      ?.find((provider) => provider.type === 'SPOTIFY')
      ?.actions?.find((action) => action.type === 'uri')?.uri ??
    track.hub?.actions?.find((action) => action.type === 'uri')?.uri

  const artists = discovery.spotifyInfo?.artists ?? []

  return (
    <article className="discovery-enter discovery-success-pulse overflow-hidden border border-border/80 bg-card">
      <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative border-b border-border/70 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <p className="eyebrow text-acid">Track discovered</p>
          {track.images?.coverart ? (
            <div className="discovery-album-art mt-6 aspect-square w-full max-w-[26rem]">
              <img
                src={track.images.coverart}
                alt={`Cover art for ${track.title ?? "the discovered track"}`}
                className="h-full w-full object-cover"/>
            </div>
          ) : (
            <div className="mt-6 flex aspect-square w-full max-w-[26rem] items-center justify-center border border-border/70">
              <span className="font-display text-4xl text-muted-foreground">♪</span>
            </div>
          )}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Audio match / Spotify artist graph
          </p>
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="discovery-title text-balance">{track.title}</h2>
                <p className="discovery-artist mt-3 text-lg font-medium">{track.subtitle}</p>
              </div>
              <span className="font-display text-5xl leading-none text-acid/70">01</span>
            </div>

            {(artists.length > 0 || spotifyUri) && (
              <div className="mt-8 space-y-4">
                {spotifyUri && (
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <a href={spotifyUri} target="_blank" rel="noopener noreferrer">
                      <img src={spotifyIcon} alt="" className="h-4 w-4" />
                      Listen on Spotify
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}

                {artists.length > 0 && (
                  <div>
                    <p className="eyebrow mb-3">Artists on this track</p>
                    <ul className="divide-y divide-border/60 border-y border-border/60">
                      {artists.map((artist: {id: string; name: string; url: string}) => (
                        <li key={artist.id}>
                          <a
                            href={artist.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between gap-4 py-3 text-sm text-cream transition-colors hover:text-acid">
                            <span className="flex items-center gap-3">
                              <img src={spotifyIcon} alt="" className="h-4 w-4" />
                              {artist.name}
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-acid" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            {artists.length > 1
              ? "Split your tip across the people who made the track, or send it all to one."
              : "Send a tip straight to the artist. The contract holds it until they claim it."}
          </p>
        </div>
      </div>

      <Separator className="opacity-60" />

      <div className="discovery-donation-section p-6 sm:p-8">
        {donationSuccess ? (
          <div className="confetti-container flex flex-col items-center justify-center gap-2 py-10 text-center">
            <h3 className="thank-you-text text-5xl">Thank you.</h3>
            <p className="text-sm text-muted-foreground">
              Your tip is on-chain. The artist can withdraw it from the claim page.
            </p>
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
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="eyebrow text-acid">Send the gratitude</p>
                <h3 className="mt-1 font-display text-3xl">
                  {artists.length === 1
                    ? "Tip the artist"
                    : `Tip ${artists.length} artists`}
                </h3>
              </div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                1% platform fee
              </p>
            </div>
            <DonationForm
              artists={artists}
              onSuccess={() => setDonationSuccess(true)}
              onDiscoverAgain={onDiscoverAgain}/>
          </>
        )}
      </div>
    </article>
  )
}
