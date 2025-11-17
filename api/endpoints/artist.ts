import type {VercelRequest, VercelResponse} from '@vercel/node'
import {fetchArtist, fetchSpotifyToken, handleApiError, handleApiSuccess} from '../api.js'
import type {SpotifyArtistResponse} from '../../types'
import {extractArtistId} from '../utils.js'

/**
 * Fetches artist information from Spotify API
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables
 *
 * Accepts artist URL (https://open.spotify.com/artist/ARTIST_ID) or artist ID
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'GET') {
    return res.status(405).json({error: 'Method not allowed'})
  }

  const {artistUrl} = req.query

  if (!artistUrl || typeof artistUrl !== 'string') {
    return res.status(400).json({error: 'Artist URL or ID is required'})
  }

  try {
    const artistId = extractArtistId(artistUrl)

    if (!artistId) {
      return res.status(400).json({error: `Invalid artist URL format: ${artistUrl}`})
    }

    const accessToken = await fetchSpotifyToken()
    const artistData = await fetchArtist(artistId, accessToken) as SpotifyArtistResponse

    return handleApiSuccess(res, {
      id: artistData.id,
      name: artistData.name,
      images: artistData.images,
    })
  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch artist from Spotify')
  }
}
