import type {VercelRequest, VercelResponse} from '@vercel/node'
import {fetchSpotifySearch, fetchSpotifyToken, fetchTrack, handleApiError, handleApiSuccess} from '../_lib/api.js'
import type {SpotifySearchResponse, SpotifyTrackResponse} from '../../types'
import {extractTrackId, formatTrackResponse} from '../_lib/utils.js'
import {rateLimit} from '../_lib/rateLimit.js'

/**
 * Fetches track information from Spotify API
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables
 *
 * Supports:
 * - spotify:track:TRACK_ID
 * - https://open.spotify.com/track/TRACK_ID
 * - spotify:search:QUERY (deeplink search)
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'GET') {
    return res.status(405).json({error: 'Method not allowed'})
  }
  if (!rateLimit(req, res, {key: 'track', limit: 60, windowMs: 60_000})) {
    return res
  }

  const {uri} = req.query

  if (!uri || typeof uri !== 'string') {
    return res.status(400).json({error: 'Spotify URI required'})
  }

  try {
    const accessToken = await fetchSpotifyToken()

    // Handle search queries. `req.query` is already URL-decoded by Vercel, so
    // decoding again would turn a literal "%" into a URIError.
    if (uri.startsWith('spotify:search:')) {
      const searchQuery = uri.slice('spotify:search:'.length).trim()
      if (!searchQuery || searchQuery.length > 200) {
        return res.status(400).json({error: 'Search query must be between 1 and 200 characters'})
      }
      const searchData = await fetchSpotifySearch(searchQuery, accessToken) as SpotifySearchResponse
      const trackData = searchData.tracks?.items?.[0]

      if (!trackData) {
        return res.status(404).json({error: `No track found: ${searchQuery}`})
      }

      return handleApiSuccess(res, formatTrackResponse(trackData))
    }

    // Handle track IDs
    const trackId = extractTrackId(uri)

    if (!trackId) {
      return res.status(400).json({error: `Invalid Spotify URI format: ${uri}`,})
    }

    const trackData = await fetchTrack(trackId, accessToken) as SpotifyTrackResponse

    return handleApiSuccess(res, formatTrackResponse(trackData))
  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch track from Spotify')
  }
}
