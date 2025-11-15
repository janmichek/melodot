import type {VercelRequest, VercelResponse} from '@vercel/node';
import {fetchSpotifyApi, fetchSpotifyToken} from '../api';
import type {SpotifyArtistInfo} from '../types';

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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ids } = req.query;

  if (!ids || typeof ids !== 'string') {
    return res.status(400).json({ error: 'Artist IDs are required (comma-separated)' });
  }

  // Split and clean up IDs
  const artistIds = ids
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);

  if (artistIds.length === 0) {
    return res.status(400).json({ error: 'At least one artist ID is required' });
  }

  // Spotify API limit is 50 artists per request
  if (artistIds.length > 50) {
    return res.status(400).json({ error: 'Maximum 50 artists per request' });
  }

  try {
    // Get Spotify access token
    const accessToken = await fetchSpotifyToken();
    
    // Fetch multiple artists from Spotify API
    // GET /v1/artists?ids={ids}
    // Note: Spotify may return null for invalid artist IDs
    const idsParam = artistIds.join(',');
    const artistsData = await fetchSpotifyApi<{ artists: (SpotifyArtistInfo | null)[] }>(
      `https://api.spotify.com/v1/artists?ids=${encodeURIComponent(idsParam)}`,
      accessToken
    );

    // Return formatted artist info map
    // Create a map for easy lookup: { artistId: { id, name, ... } }
    // Invalid artist IDs will be skipped (null values in response)
    const artistsMap: Record<string, SpotifyArtistInfo> = {};
    
    artistsData.artists.forEach((artist) => {
      if (artist && artist.id) {
        artistsMap[artist.id] = {
          id: artist.id,
          name: artist.name,
          genres: artist.genres || [],
          popularity: artist.popularity || 0,
          followers: artist.followers || { total: 0 },
          images: artist.images || [],
          external_urls: artist.external_urls || { spotify: '' },
        };
      }
    });

    return res.status(200).json(artistsMap);
  } catch (error) {
    const status = (error as any)?.status ?? 500;
    return res.status(status).json({
      error: `Failed to fetch artists from Spotify: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

