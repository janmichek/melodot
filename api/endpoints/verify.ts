import type {VercelRequest, VercelResponse} from '@vercel/node';
import {fetchRapidApiBiography} from '../api';
import type {RapidApiResponse} from '../types';

/**
 * Verifies that artist biography contains the verification code #8
 * Requires RAPIDAPI_KEY environment variable
 *
 * Uses the /v1/artist/overview endpoint with artistId parameter
 * Accepts artist ID only
 * Returns verification result (does not return bio to frontend)
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
    
    const bio = biography.biography;
    
    const verificationCode = '#8';
    
    return res.status(200).json({
      verified: bio.includes(verificationCode),
    });
  } catch (error) {
    const status = (error as any)?.status ?? 500;
    return res.status(status).json({
      error: `Failed to verify artist: ${error instanceof Error ? error.message : 'Unknown error'}`,
      verified: false,
    });
  }
}

