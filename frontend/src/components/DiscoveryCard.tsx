interface DiscoveryCardProps {
  result: any;
}

export default function DiscoveryCard({ result }: DiscoveryCardProps) {
  if (!result) return null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const track = result.track;


  return (
    <div className="p-5 bg-gray-100 rounded mt-5">
      {track ? (
        <div>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
          <p><strong>Title:</strong> {track.title || 'Unknown'}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
          <p><strong>Artist:</strong> {track.subtitle || 'Unknown'}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
          {track.sections?.[0]?.metadata?.[0]?.text && (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            <p><strong>Album:</strong> {track.sections[0].metadata[0].text}</p>
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
          {track.sections?.[0]?.metadata?.[2]?.text && (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            <p><strong>Released:</strong> {track.sections[0].metadata[2].text}</p>
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
          {track.images?.coverart && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              src={track.images.coverart}
              alt="Album cover"
              className="w-48 h-48 object-cover mt-2.5"
            />
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */}
          {track.hub?.actions?.some((action: any) => action.type === 'uri') && (
            <p className="mt-2.5">
              <a
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                href={track.hub.actions.find((action: any) => action.type === 'uri')?.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 no-underline font-bold"
              >
                🎵 Listen on Spotify
              </a>
            </p>
          )}

          {/* Display Artist Info */}
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
          {result.artistInfo && (
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="font-bold mb-3">MusicBrainz Artist Details:</p>

              {/* Artist metadata */}
              <div className="mb-3 text-sm text-gray-700">
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {result.artistInfo.type && (
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  <p><strong>Type:</strong> {result.artistInfo.type}</p>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {result.artistInfo.country && (
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  <p><strong>Country:</strong> {result.artistInfo.country}</p>
                )}
              </div>

              {/* Social Links */}
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
              {result.artistInfo.socialLinks && (
                <>
                  <p className="font-semibold mb-2">Social Media:</p>
                  <div className="flex flex-wrap gap-3">
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {result.artistInfo.socialLinks.twitter && (
                  <a
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    href={result.artistInfo.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600 font-semibold"
                    title="Twitter/X"
                  >
                    𝕏 Twitter
                  </a>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {result.artistInfo.socialLinks.instagram && (
                  <a
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    href={result.artistInfo.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-700 font-semibold"
                    title="Instagram"
                  >
                    📷 Instagram
                  </a>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {result.artistInfo.socialLinks.facebook && (
                  <a
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    href={result.artistInfo.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                    title="Facebook"
                  >
                    📘 Facebook
                  </a>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {result.artistInfo.socialLinks.youtube && (
                  <a
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    href={result.artistInfo.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800 font-semibold"
                    title="YouTube"
                  >
                    📺 YouTube
                  </a>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {result.artistInfo.socialLinks.tiktok && (
                  <a
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    href={result.artistInfo.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:text-gray-700 font-semibold"
                    title="TikTok"
                  >
                    🎵 TikTok
                  </a>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {result.artistInfo.socialLinks.soundcloud && (
                  <a
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    href={result.artistInfo.socialLinks.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-700 font-semibold"
                    title="SoundCloud"
                  >
                    ☁️ SoundCloud
                  </a>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {result.artistInfo.socialLinks.bandcamp && (
                  <a
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    href={result.artistInfo.socialLinks.bandcamp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-800 font-semibold"
                    title="Bandcamp"
                  >
                    🎸 Bandcamp
                  </a>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {result.artistInfo.socialLinks.website && (
                  <a
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    href={result.artistInfo.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900 font-semibold"
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
