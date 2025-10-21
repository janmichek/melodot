interface DiscoveryCardProps {
  result: any;
}

export default function DiscoveryCard({ result }: DiscoveryCardProps) {
  if (!result) return null;

  const track = result.track;

  return (
    <div className="discovery-card">
      {track ? (
        <div className="discovery-track-info">
          <p><strong>Title:</strong> {track.title || 'Unknown'}</p>
          <p><strong>Artist:</strong> {track.subtitle || 'Unknown'}</p>
          {track.sections?.[0]?.metadata?.[0]?.text && (
            <p><strong>Album:</strong> {track.sections[0].metadata[0].text}</p>
          )}
          {track.sections?.[0]?.metadata?.[2]?.text && (
            <p><strong>Released:</strong> {track.sections[0].metadata[2].text}</p>
          )}
          {track.images?.coverart && (
            <img
              src={track.images.coverart}
              alt="Album cover"
              className="discovery-album-cover"
            />
          )}
          {track.hub?.actions?.some((action: any) => action.type === 'uri') && (
            <p className="discovery-spotify-link">
              <a
                href={track.hub.actions.find((action: any) => action.type === 'uri')?.uri}
                target="_blank"
                rel="noopener noreferrer"
              >
                🎵 Listen on Spotify
              </a>
            </p>
          )}

          {result.artistInfo && (
            <div className="discovery-artist-section">
              <p className="discovery-artist-title">MusicBrainz Artist Details:</p>

              <div className="discovery-artist-details">
                {result.artistInfo.type && (
                  <p><strong>Type:</strong> {result.artistInfo.type}</p>
                )}
                {result.artistInfo.country && (
                  <p><strong>Country:</strong> {result.artistInfo.country}</p>
                )}
              </div>

              {result.artistInfo.socialLinks && (
                <>
                  <p className="discovery-social-title">Social Media:</p>
                  <div className="discovery-social-links">
                {result.artistInfo.socialLinks.twitter && (
                  <a
                    href={result.artistInfo.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-twitter"
                    title="Twitter/X"
                  >
                    𝕏 Twitter
                  </a>
                )}
                {result.artistInfo.socialLinks.instagram && (
                  <a
                    href={result.artistInfo.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-instagram"
                    title="Instagram"
                  >
                    📷 Instagram
                  </a>
                )}
                {result.artistInfo.socialLinks.facebook && (
                  <a
                    href={result.artistInfo.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-facebook"
                    title="Facebook"
                  >
                    📘 Facebook
                  </a>
                )}
                {result.artistInfo.socialLinks.youtube && (
                  <a
                    href={result.artistInfo.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-youtube"
                    title="YouTube"
                  >
                    📺 YouTube
                  </a>
                )}
                {result.artistInfo.socialLinks.tiktok && (
                  <a
                    href={result.artistInfo.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-tiktok"
                    title="TikTok"
                  >
                    🎵 TikTok
                  </a>
                )}
                {result.artistInfo.socialLinks.soundcloud && (
                  <a
                    href={result.artistInfo.socialLinks.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-soundcloud"
                    title="SoundCloud"
                  >
                    ☁️ SoundCloud
                  </a>
                )}
                {result.artistInfo.socialLinks.bandcamp && (
                  <a
                    href={result.artistInfo.socialLinks.bandcamp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-bandcamp"
                    title="Bandcamp"
                  >
                    🎸 Bandcamp
                  </a>
                )}
                {result.artistInfo.socialLinks.website && (
                  <a
                    href={result.artistInfo.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-website"
                    title="Official Website"
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            </>
          )}
            </div>
          )}
        </div>
      ) : (
        <p>No music recognized in this audio file.</p>
      )}
    </div>
  );
}
