import type {VercelRequest, VercelResponse} from '@vercel/node';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrackInfo {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }>;
  album: {
    id: string;
    name: string;
    release_date: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    external_urls: {
      spotify: string;
    };
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrackInfo[];
  };
}

/**
 * Get Spotify access token
 */
async function getSpotifyToken(clientId: string, clientSecret: string): Promise<string> {
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to get Spotify access token: ${errorText}`);
  }

  const tokenData = await tokenResponse.json() as SpotifyTokenResponse;
  return tokenData.access_token;
}

/**
 * Format track response
 */
function formatTrackResponse(trackData: SpotifyTrackInfo) {
  return {
    id: trackData.id,
    name: trackData.name,
    artists: trackData.artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      url: artist.external_urls.spotify,
    })),
    album: {
      id: trackData.album.id,
      name: trackData.album.name,
      releaseDate: trackData.album.release_date,
      coverUrl: trackData.album.images[0]?.url,
      url: trackData.album.external_urls.spotify,
    },
    durationMs: trackData.duration_ms,
    popularity: trackData.popularity,
    previewUrl: trackData.preview_url,
    url: trackData.external_urls.spotify,
  };
}

/**
 * Handle Spotify search
 */
async function handleSpotifySearch(
  res: VercelResponse,
  searchQuery: string,
  clientId: string,
  clientSecret: string
): Promise<VercelResponse> {
  try {
    const accessToken = await getSpotifyToken(clientId, clientSecret);

    // Search for tracks
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Spotify search error:', errorText);
      return res.status(searchResponse.status).json({
        error: 'Failed to search Spotify',
        details: errorText,
      });
    }

    const searchData = await searchResponse.json() as SpotifySearchResponse;

    if (!searchData.tracks.items || searchData.tracks.items.length === 0) {
      return res.status(404).json({
        error: 'No track found',
        details: 'No results for the search query',
      });
    }

    const trackData = searchData.tracks.items[0];
    return res.status(200).json(formatTrackResponse(trackData));
  } catch (error) {
    console.error('Error in Spotify search:', error);
    return res.status(500).json({
      error: 'Failed to search Spotify',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

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
    // Check for Spotify credentials
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        error: 'Spotify API not configured',
        details: 'Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables',
      });
    }

    // Extract track ID from Spotify URI
    // URI format: spotify:track:TRACK_ID or https://open.spotify.com/track/TRACK_ID
    // Also handles deeplinks like: spotify:search:QUERY
    let trackId: string;
    if (uri.startsWith('spotify:track:')) {
      trackId = uri.replace('spotify:track:', '');
    } else if (uri.includes('open.spotify.com/track/')) {
      const match = uri.match(/track\/([a-zA-Z0-9]+)/);
      trackId = match ? match[1] : '';
    } else if (uri.startsWith('spotify:search:')) {
      // Handle search deeplinks - extract and use search API
      const searchQuery = decodeURIComponent(uri.replace('spotify:search:', ''));
      return await handleSpotifySearch(res, searchQuery, clientId, clientSecret);
    } else {
      console.error('Invalid URI format:', uri);
      return res.status(400).json({
        error: 'Invalid Spotify URI format',
        details: `Received URI: ${uri}. Expected formats: spotify:track:ID, spotify:search:QUERY, or open.spotify.com/track/ID`
      });
    }

    if (!trackId) {
      return res.status(400).json({ error: 'Could not extract track ID from URI' });
    }

    // Get Spotify access token
    const accessToken = await getSpotifyToken(clientId, clientSecret);

    // Fetch track information
    const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!trackResponse.ok) {
      const errorText = await trackResponse.text();
      console.error('Spotify track fetch error:', errorText);
      return res.status(trackResponse.status).json({
        error: 'Failed to fetch track from Spotify',
        details: errorText,
      });
    }

    const trackData = await trackResponse.json() as SpotifyTrackInfo;
    return res.status(200).json(formatTrackResponse(trackData));
  } catch (error) {
    console.error('Error fetching Spotify track:', error);
    return res.status(500).json({
      error: 'Failed to fetch Spotify track',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
