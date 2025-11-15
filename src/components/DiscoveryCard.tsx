import {DiscoveryResult} from "../types";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {ExternalLink, Music, Music2, User} from "lucide-react";
import {DonationForm} from "./DonationForm";

interface DiscoveryCardProps {
  discovery: DiscoveryResult;
}

export default function DiscoveryCard({ discovery }: DiscoveryCardProps) {
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
  const metadata = track.sections?.find((section) => section.type === 'SONG')?.metadata;
  const releasedMetadata = metadata?.find((item) => item.title === 'Released');
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
        <div className="flex flex-row">
          {track.images?.coverart && (
            <div className="relative w-48 h-48 mx-auto md:mx-0">
              <img
                src={track.images.coverart}
                alt="Album cover"
                className="w-full h-full object-cover rounded-xl shadow-2xl ring-1 ring-border/50"
              />
            </div>
          )}

          <div className="space-4 flex flex-col justify-center">
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
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
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
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
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
        {discovery.spotifyInfo?.artists?.[0]?.id && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide flex items-center gap-2">
                <Music2 className="h-4 w-4" />
                Donate to artists
              </h3>

              <div className="space-y-3">
                <DonationForm artistId={discovery.spotifyInfo.artists[0].id} />
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
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
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
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
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
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
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
