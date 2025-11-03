import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Fetches user profile from Spotify
 * Requires accessToken as query parameter
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessToken } = req.query;

    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Fetch user profile from Spotify
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      if (profileResponse.status === 401) {
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'Access token is invalid or expired',
        });
      }

      const errorText = await profileResponse.text();
      console.error('Spotify profile error:', errorText);
      return res.status(profileResponse.status).json({
        error: 'Failed to fetch profile',
        details: errorText,
      });
    }

    const profile = await profileResponse.json();

    // Return formatted profile
    return res.status(200).json({
      id: profile.id,
      displayName: profile.display_name,
      email: profile.email,
      country: profile.country,
      product: profile.product,
      followers: profile.followers?.total || 0,
      images: profile.images || [],
      uri: profile.uri,
      externalUrls: profile.external_urls,
    });
  } catch (error) {
    console.error('Spotify profile error:', error);
    return res.status(500).json({
      error: 'Failed to fetch profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
