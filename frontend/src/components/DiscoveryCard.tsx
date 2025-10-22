import { DiscoveryResult } from "../types";

export default function DiscoveryCard({ discovery }: { discovery: DiscoveryResult }) {
  if (!discovery) {
    console.log('DiscoveryCard: No discovery provided');
    return null;
  }

  console.log('DiscoveryCard: Rendering with discovery', discovery);

  const track = discovery.track;

  if (!track) {
    console.log('DiscoveryCard: No track in result');
    return (
      <div className="discovery-card">
        <p>No music recognized in this audio file.</p>
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
  const metadata = track.sections?.find((section) => section.type === 'SONG')?.metadata || track.sections?.[0]?.metadata;
  const albumMetadata = metadata?.find((item) => item.title === 'Album' || item.title === 'Álbum');
  const releasedMetadata = metadata?.find((item) => item.title === 'Released' || item.title === 'Lançado');

  return (
    <div className="discovery-card">
      <div className="discovery-track-info">
        <p><strong>Title:</strong> {track.title || 'Unknown'}</p>
        <p><strong>Artist:</strong> {track.subtitle || 'Unknown'}</p>
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
            <p className="discovery-artist-title">MusicBrainz Artist Details:</p>

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
                <p className="discovery-social-title">Social Media:</p>
                <div className="discovery-social-links">
                  {discovery.artistInfo.socialLinks.twitter && (
                    <a
                      href={discovery.artistInfo.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-twitter"
                      title="Twitter/X"
                    >
                      𝕏 Twitter
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.instagram && (
                    <a
                      href={discovery.artistInfo.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-instagram"
                      title="Instagram"
                    >
                      📷 Instagram
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.facebook && (
                    <a
                      href={discovery.artistInfo.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-facebook"
                      title="Facebook"
                    >
                      📘 Facebook
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.youtube && (
                    <a
                      href={discovery.artistInfo.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-youtube"
                      title="YouTube"
                    >
                      📺 YouTube
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.tiktok && (
                    <a
                      href={discovery.artistInfo.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-tiktok"
                      title="TikTok"
                    >
                      🎵 TikTok
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.soundcloud && (
                    <a
                      href={discovery.artistInfo.socialLinks.soundcloud}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-soundcloud"
                      title="SoundCloud"
                    >
                      ☁️ SoundCloud
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.bandcamp && (
                    <a
                      href={discovery.artistInfo.socialLinks.bandcamp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-bandcamp"
                      title="Bandcamp"
                    >
                      🎸 Bandcamp
                    </a>
                  )}
                  {discovery.artistInfo.socialLinks.website && (
                    <a
                      href={discovery.artistInfo.socialLinks.website}
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
    </div>
  );
}
