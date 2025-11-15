import type {VercelRequest, VercelResponse} from '@vercel/node';
import {fetchRapidApiBiography} from '../api';
import type {RapidApiResponse} from '../types';

/**
 * Fetches artist biography from RapidAPI Spotify Scraper
 * Requires RAPIDAPI_KEY environment variable
 *
 * Uses the /v1/artist/overview endpoint with artistId parameter
 * Accepts artist ID only
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'GET') {
    return res.status(405).json({error: 'Method not allowed'});
  }
  
  const {artistId} = req.query;
  
  if (!artistId || typeof artistId !== 'string') {
    return res.status(400).json({error: 'Artist ID is required'});
  }
  
  try {
    const biography = await fetchRapidApiBiography(artistId) as RapidApiResponse;
    
    // Extract biography from overview response
    const bio =
      biography.biography ||
      biography.data?.biography ||
      biography.artist?.biography ||
      null;
    
    return res.status(200).json({
      status: biography.status || true,
      biography: bio,
    });
  } catch (error) {
    const status = (error as any)?.status ?? 500;
    return res.status(status).json({
      error: `Failed to fetch artist biography: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

