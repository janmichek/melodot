import { DiscoveryResult } from "../types";

interface DiscoveryCardProps {
  discovery: DiscoveryResult;
  onSearchAgain?: () => void;
}

export default function DiscoveryCard({ discovery, onSearchAgain }: DiscoveryCardProps) {
  if (!discovery) {
    console.log('DiscoveryCard: No discovery provided');
    return null;
  }

  console.log('DiscoveryCard: Rendering with discovery', discovery);

  const track = discovery.track;

  if (!track) {
    return (
      <div className="discovery-card">
        No music recognized in this audio file.
      </div>
    );
  }

  console.log('DiscoveryCard: Track data', {
    title: track.title,
    subtitle: track.subtitle,
    sections: track.sections,
    images: track.images,
  });

  // Find metadata in sections
  const metadata = track.sections?.find((section) => section.type === 'SONG')?.metadata;
  const albumMetadata = metadata?.find((item) => item.title === 'Album');
  const releasedMetadata = metadata?.find((item) => item.title === 'Released');

  return (
    <div className="discovery-card">
      {onSearchAgain && (
        <button
          onClick={onSearchAgain}
          className="btn-secondary"
          style={{ marginBottom: '1rem' }}
        >
          ← Search Again
        </button>
      )}
      <div className="discovery-track-info">
        <p><strong>Title:</strong> {track.title}</p>
        <p><strong>Artist:</strong> {track.subtitle}</p>
        {albumMetadata?.text && (
          <p><strong>Album:</strong> {albumMetadata.text}</p>
        )}
        {releasedMetadata?.text && (
          <p><strong>Released:</strong> {releasedMetadata.text}</p>
        )}
        {track.images?.coverart && (
          <img
            src={track.images.coverart}
            alt="Album cover"
            className="discovery-album-cover"
          />
        )}
        {track.hub?.actions?.some((action) => action.type === 'uri') && (
          <p className="discovery-spotify-link">
            <a
              href={track.hub.actions.find((action) => action.type === 'uri')?.uri || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              🎵 Listen on Spotify
            </a>
          </p>
        )}

        {discovery.artistInfo && (
          <div className="discovery-artist-section">
            <p className="discovery-artist-title">
              MusicBrainz Artist Details:
              {/*todo check the responses*/}
            </p>

            <div className="discovery-artist-details">
              {discovery.artistInfo.type && (
                <p><strong>Type:</strong> {discovery.artistInfo.type}</p>
              )}
              {discovery.artistInfo.country && (
                <p><strong>Country:</strong> {discovery.artistInfo.country}</p>
              )}
            </div>

            {discovery.artistInfo.socialLinks && (
              <>
                <div className="discovery-social-title">
                  Social Media:
                </div>
                <div className="discovery-social-links">
                  {discovery.artistInfo.socialLinks.bandcamp && (
                    <a
                      href={discovery.artistInfo.socialLinks.bandcamp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-bandcamp"
                      title="Bandcamp">
                      🎸 Bandcamp
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.soundcloud && (
                    <a
                      href={discovery.artistInfo.socialLinks.soundcloud}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-soundcloud"
                      title="SoundCloud">
                      ☁️ SoundCloud
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.youtube && (
                    <a
                      href={discovery.artistInfo.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-youtube"
                      title="YouTube">
                      📺 YouTube
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.instagram && (
                    <a
                      href={discovery.artistInfo.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-instagram"
                      title="Instagram">
                      📷 Instagram
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.facebook && (
                    <a
                      href={discovery.artistInfo.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-facebook"
                      title="Facebook">
                      📘 Facebook
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.tiktok && (
                    <a
                      href={discovery.artistInfo.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-tiktok"
                      title="TikTok">
                      🎵 TikTok
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
