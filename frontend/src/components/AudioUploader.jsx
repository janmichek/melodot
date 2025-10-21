import Image from 'next/image';

/**
 * @typedef {Object} MetadataItem
 * @property {string} [text]
 */

/**
 * @typedef {Object} Section
 * @property {Array<MetadataItem>} [metadata]
 */

/**
 * @typedef {Object} TrackResult
 * @property {Object} track
 * @property {string} [track.title]
 * @property {string} [track.subtitle]
 * @property {Object} [track.images]
 * @property {string} [track.images.coverart]
 * @property {Array<Section>} [track.sections]
 * @property {Object} [track.hub]
 * @property {Array<{type: string, uri?: string}>} [track.hub.actions]
 */

/**
 * @param {Object} props
 * @param {Function} props.handleSubmit
 * @param {TrackResult | null} [props.result]
 * @param {string | null} [props.error]
 */
export default function AudioUploader({ handleSubmit: _handleSubmit, result = null, error = null }) {
  return (
    <div className="p-5 max-w-xl mx-auto">
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-400 rounded text-red-700 mb-5">
          {error}
        </div>
      )}
      <div className="p-5 bg-gray-100 rounded mt-5">
        {result ? (
          <div>
            <p><strong>Title:</strong> {result.track?.title ?? 'Unknown'}</p>
            <p><strong>Artist:</strong> {result.track?.subtitle ?? 'Unknown'}</p>
            {result.track?.sections?.[0]?.metadata?.[0]?.text && (
              <p><strong>Album:</strong> {result.track.sections[0].metadata[0].text}</p>
            )}
            {result.track?.sections?.[0]?.metadata?.[2]?.text && (
              <p><strong>Released:</strong> {result.track.sections[0].metadata[2].text}</p>
            )}
            {result.track?.images?.coverart && (
              <Image
                src={result.track.images.coverart}
                alt="Album cover"
                width={192}
                height={192}
                className="object-cover mt-2.5"
              />
            )}
            {result.track?.hub?.actions?.some(action => action.type === 'uri') && (
              <p className="mt-2.5">
                <a
                  href={result.track.hub.actions.find(action => action.type === 'uri')?.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 no-underline font-bold"
                >
                  🎵 Listen on Spotify
                </a>
              </p>
            )}
          </div>
        ) : (
          <p>No music recognized in this audio file.</p>
        )}
      </div>
    </div>
  );
}
