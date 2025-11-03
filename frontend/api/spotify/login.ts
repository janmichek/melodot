import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Initiates Spotify OAuth login flow
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_REDIRECT_URI environment variables
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const spotifyRedirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!spotifyClientId) {
      return res.status(500).json({
        error: 'Spotify client ID not configured',
        details: 'Set SPOTIFY_CLIENT_ID environment variable',
      });
    }

    if (!spotifyRedirectUri) {
      return res.status(500).json({
        error: 'Spotify redirect URI not configured',
        details: 'Set SPOTIFY_REDIRECT_URI environment variable',
      });
    }

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(7);
    const scope = 'user-read-private user-read-email';

    // Build Spotify authorization URL
    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: spotifyClientId,
      scope: scope,
      redirect_uri: spotifyRedirectUri,
      state: state,
    })}`;

    return res.status(200).json({ authUrl, state });
  } catch (error) {
    console.error('Spotify login error:', error);
    return res.status(500).json({
      error: 'Failed to initiate login',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
