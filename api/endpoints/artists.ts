import type {VercelRequest, VercelResponse} from '@vercel/node'
import {fetchArtists, fetchSpotifyToken, handleApiError, handleApiSuccess} from '../api.js'
import type {ArtistsMap, SpotifyArtistResponse} from '../../types'

/**
 * Fetches multiple artists information from Spotify API
 * Uses GET /v1/artists?ids={ids} endpoint
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables
 *
 * Accepts comma-separated artist IDs in query parameter: ?ids=id1,id2,id3
 * Maximum 50 artists per request (Spotify API limit)
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'GET') {
    return res.status(405).json({error: 'Method not allowed'})
  }

  const {ids} = req.query

  if (!ids || typeof ids !== 'string') {
    return res.status(400).json({error: 'Artist IDs are required (comma-separated)'})
  }

  try {
    const accessToken = await fetchSpotifyToken()
    const artistsData = await fetchArtists(ids, accessToken) as { artists: (SpotifyArtistResponse | null)[] }

    // Return formatted artist info map
    // Create a map for easy lookup: { artistId: { id, name, ... } }
    // Invalid artist IDs will be skipped (null values in response)
    const artistsMap: ArtistsMap = {}

    artistsData.artists.forEach((artist) => {
      if (artist && artist.id) {
        artistsMap[artist.id] = {
          id: artist.id,
          name: artist.name,
          images: artist.images || [],
          external_urls: artist.external_urls || {spotify: ''},
        }
      }
    })

    return handleApiSuccess(res, artistsMap)
  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch artists from Spotify')
  }
}

