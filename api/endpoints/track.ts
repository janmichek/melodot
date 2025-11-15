import type {VercelRequest, VercelResponse} from '@vercel/node';
import { fetchSpotifyToken, fetchSpotifyTrack, fetchSpotifySearch } from '../api';
import type { SpotifyTrackInfo, SpotifySearchResponse } from '../types';
import { formatTrackResponse, extractTrackId } from '../utils';

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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uri } = req.query;

  if (!uri || typeof uri !== 'string') {
    return res.status(400).json({ error: 'Spotify URI required' });
  }

  try {
    const accessToken = await fetchSpotifyToken();

    // Handle search queries
    if (uri.startsWith('spotify:search:')) {
      const searchQuery = decodeURIComponent(uri.replace('spotify:search:', ''));
      const searchData = await fetchSpotifySearch(searchQuery, accessToken) as SpotifySearchResponse;
      const trackData = searchData.tracks?.items?.[0];

      if (!trackData) {
        return res.status(404).json({ error: `No track found: ${searchQuery}` });
      }

      return res.status(200).json(formatTrackResponse(trackData));
    }

    // Handle track IDs
    // const trackId = extractTrackId(uri);
    //
    // if (!trackId) {
    //   return res.status(400).json({
    //     error: `Invalid Spotify URI format: ${uri}`,
    //   });
    // }
    //
    // const trackData = await fetchSpotifyTrack(trackId, accessToken) as SpotifyTrackInfo;
    // return res.status(200).json(formatTrackResponse(trackData));
  } catch (error) {
    const status = (error as any)?.status ?? 500;
    return res.status(status).json({
      error: `Failed to fetch track from Spotify: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}
