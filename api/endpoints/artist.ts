import type {VercelRequest, VercelResponse} from '@vercel/node';
import { fetchSpotifyToken, fetchSpotifyArtist } from '../api';
import type { SpotifyArtistInfo } from '../types';
import { extractArtistId } from '../utils';

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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artistUrl } = req.query;

  if (!artistUrl || typeof artistUrl !== 'string') {
    return res.status(400).json({ error: 'Artist URL or ID is required' });
  }

  try {
    const artistId = extractArtistId(artistUrl);

    if (!artistId) {
      return res.status(400).json({ error: `Invalid artist URL format: ${artistUrl}` });
    }

    // Get Spotify access token and fetch artist information
    const accessToken = await fetchSpotifyToken();
    const artistData = await fetchSpotifyArtist(artistId, accessToken) as SpotifyArtistInfo;

    // Return formatted artist info
    return res.status(200).json({
      id: artistData.id,
      name: artistData.name,
      images: artistData.images,
    });
  } catch (error) {
    const status = (error as any)?.status ?? 500;
    return res.status(status).json({
      error: `Failed to fetch artist from Spotify: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}
