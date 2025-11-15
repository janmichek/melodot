import {DiscoveryResult} from "@/types";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {ExternalLink, Facebook, Instagram, Music, Music2, User, Youtube} from "lucide-react";
import {DonationForm} from "@/components/DonationForm";
import spotifyIcon from "@/assets/icons/spotify.svg";

interface DiscoveryCardProps {
  discovery: DiscoveryResult;
  onDiscoverAgain?: () => void;
}

export default function DiscoveryCard({ discovery, onDiscoverAgain }: DiscoveryCardProps) {
  if (!discovery) {
    return null;
  }

  const track = discovery.track;

  if (!track) {
    return (
      <Card className="backdrop-blur-sm bg-card/50">
        <CardContent className="p-8 text-center">
          <Music2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No music recognized in this audio file.</p>
        </CardContent>
      </Card>
    );
  }

  // Find metadata in sections
  const spotifyUri = track.hub?.actions?.find((action) => action.type === 'uri')?.uri;

  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-card/95 border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Music2 className="h-5 w-5 text-primary" />
          Track Discovered!
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-row gap-6">
          {track.images?.coverart && (
            <div className="relative w-48 h-48 flex-shrink-0 mx-auto md:mx-0 aspect-square">
              <img
                src={track.images.coverart}
                alt="Album cover"
                className="w-full h-full object-cover rounded-xl shadow-2xl ring-1 ring-border/50"
              />
            </div>
          )}

          <div className="space-4 flex flex-col justify-center flex-1 min-w-0">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {track.title}
              </h2>

              <p className="text-lg font-semibold text-foreground/90">
                {track.subtitle}
              </p>
            </div>


            {spotifyUri && (
              <div className="mt-4 space-y-3">
                <Button
                  asChild
                  className="w-full md:w-auto bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <a
                    href={spotifyUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <img src={spotifyIcon} alt="Spotify" className="h-5 w-5" />
                    Listen on Spotify
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                {/* Spotify Artist Links */}
                {discovery.spotifyInfo?.artists && discovery.spotifyInfo.artists.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {discovery.spotifyInfo.artists.map((artist) => (
                      <a
                        key={artist.id}
                        href={artist.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[#1DB954] hover:text-[#1ed760] underline underline-offset-4 hover:underline-offset-2 transition-all"
                      >
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
        {discovery.spotifyInfo?.artists && discovery.spotifyInfo.artists.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide flex items-center gap-2">
                <Music2 className="h-4 w-4" />
                {discovery.spotifyInfo.artists.length === 1
                  ? "Donate to Artist"
                  : `Donate to ${discovery.spotifyInfo.artists.length} artists`}
              </h3>

              <div className="space-y-3">
                <DonationForm 
                  artists={discovery.spotifyInfo.artists} 
                  onDiscoverAgain={onDiscoverAgain}
                />
              </div>

              {/* Audio Preview Link */}
              {discovery.spotifyInfo?.previewUrl && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={discovery.spotifyInfo.previewUrl} target="_blank" rel="noopener noreferrer">
                      <Music className="h-3 w-3 mr-1" />
                      Play Audio Preview
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Artist Social Links */}
        {discovery.artistInfo?.socialLinks && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide flex items-center gap-2">
                <User className="h-4 w-4" />
                Connect with the Artist
              </h3>

              <div className="flex flex-wrap gap-2">
                {discovery.artistInfo.socialLinks.youtube && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50 transition-colors"
                  >
                    <a
                      href={discovery.artistInfo.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </a>
                  </Button>
                )}

                {discovery.artistInfo.socialLinks.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/50 transition-colors"
                  >
                    <a
                      href={discovery.artistInfo.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </a>
                  </Button>
                )}

                {discovery.artistInfo.socialLinks.facebook && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50 transition-colors"
                  >
                    <a
                      href={discovery.artistInfo.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </a>
                  </Button>
                )}

                {discovery.artistInfo.socialLinks.soundcloud && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/50 transition-colors"
                  >
                    <a
                      href={discovery.artistInfo.socialLinks.soundcloud}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Music className="h-4 w-4" />
                      SoundCloud
                    </a>
                  </Button>
                )}

                {discovery.artistInfo.socialLinks.bandcamp && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500/50 transition-colors"
                  >
                    <a
                      href={discovery.artistInfo.socialLinks.bandcamp}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Music className="h-4 w-4" />
                      Bandcamp
                    </a>
                  </Button>
                )}

                {discovery.artistInfo.socialLinks.tiktok && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover:bg-black/10 hover:text-foreground hover:border-foreground/50 transition-colors dark:hover:bg-white/10"
                  >
                    <a
                      href={discovery.artistInfo.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Music className="h-4 w-4" />
                      TikTok
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
