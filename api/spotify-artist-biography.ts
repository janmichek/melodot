import type {VercelRequest, VercelResponse} from '@vercel/node';

interface RapidApiResponse {
  status: boolean;
  errorId?: string;
  biography?: string;
  description?: string;
  about?: string;
  artist?: {
    biography?: string;
    description?: string;
    about?: string;
    [key: string]: any;
  };
  data?: {
    biography?: string;
    description?: string;
    about?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Fetches artist biography from RapidAPI Spotify Scraper
 * Requires RAPIDAPI_KEY or VITE_RAPIDAPI_KEY environment variable
 * 
 * Uses the /v1/artist/overview endpoint with artistId parameter
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
    return res.status(400).json({ error: 'Artist URL is required' });
  }

  try {
    // Check for RapidAPI key
    const apiKey = process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'RapidAPI key not configured',
        details: 'Set RAPIDAPI_KEY or VITE_RAPIDAPI_KEY environment variable',
      });
    }

    // Extract artist ID from URL
    // Format: https://open.spotify.com/artist/ARTIST_ID
    let artistId: string | null = null;
    
    if (artistUrl.includes('open.spotify.com/artist/')) {
      // Extract artist ID from URL
      const match = artistUrl.match(/artist\/([a-zA-Z0-9]+)/);
      if (match) {
        artistId = match[1];
      }
    } else {
      // If it's not a full URL, assume it's already an artist ID
      artistId = artistUrl;
    }

    if (!artistId) {
      return res.status(400).json({ 
        error: 'Invalid artist URL format',
        details: 'Expected format: https://open.spotify.com/artist/ARTIST_ID or just ARTIST_ID'
      });
    }

    // Call RapidAPI Spotify Scraper using /v1/artist/overview endpoint
    // According to the API docs, this endpoint uses artistId parameter
    const rapidApiUrl = `https://spotify-scraper.p.rapidapi.com/v1/artist/overview?artistId=${encodeURIComponent(artistId)}`;

    let biographyResponse;
    let errorMessage = '';

    try {
      todo move all fetch blocks from api folder to api/api.ts
      biographyResponse = await fetch(rapidApiUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'spotify-scraper.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
        },
      });
    } catch (fetchError) {
      errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
    }

    if (!biographyResponse || !biographyResponse.ok) {
      const errorText = biographyResponse ? await biographyResponse.text() : errorMessage;
      console.error('RapidAPI biography fetch error:', errorText);
      
      // Return a helpful error message
      return res.status(biographyResponse?.status || 500).json({
        error: 'Failed to fetch artist biography',
        details: errorText,
        note: 'The RapidAPI endpoint structure may need adjustment. Check the RapidAPI documentation for the correct endpoint path.',
      });
    }

    const overviewData = await biographyResponse.json() as RapidApiResponse;
    
    // Extract biography from overview response
    // The /v1/artist/overview endpoint may have biography in different fields
    // Check multiple possible locations for biography data
    const biography = overviewData.biography || 
                     overviewData.data?.biography || 
                     overviewData.description ||
                     overviewData.about ||
                     overviewData.artist?.biography ||
                     overviewData.artist?.description ||
                     overviewData.artist?.about ||
                     null;
    // todo reduce unused || conditions. investigate what i read on FE

    return res.status(200).json({
      status: overviewData.status || true,
      biography: biography,
      rawData: overviewData, // Include raw data for debugging
      // todo remove if no need for raw data are unused?
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch artist biography',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

