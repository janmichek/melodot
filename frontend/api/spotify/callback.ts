import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Spotify OAuth callback handler
 * Exchanges authorization code for access token
 * Requires SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI
 *
 * Note: For production, store tokens in a database (Vercel KV, MongoDB, etc.)
 * or use JWT tokens. This implementation returns tokens directly to client.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const spotifyRedirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!spotifyClientId || !spotifyClientSecret) {
      return res.status(500).json({
        error: 'Spotify credentials not configured',
        details: 'Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET',
      });
    }

    if (!spotifyRedirectUri) {
      return res.status(500).json({
        error: 'Spotify redirect URI not configured',
        details: 'Set SPOTIFY_REDIRECT_URI',
      });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization':
          'Basic ' +
          Buffer.from(spotifyClientId + ':' + spotifyClientSecret).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: spotifyRedirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Spotify token error:', errorText);
      return res.status(tokenResponse.status).json({
        error: 'Failed to get access token',
        details: errorText,
      });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // For development: return tokens to client
    // For production: Store in database and return session ID
    return res.status(200).json({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      // Optionally return session ID if using server-side storage:
      // sessionId: generateSessionId(access_token, refresh_token)
    });
  } catch (error) {
    console.error('Spotify callback error:', error);
    return res.status(500).json({
      error: 'Failed to complete authentication',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
