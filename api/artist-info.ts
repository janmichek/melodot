import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Fetches artist information from Shazam API
 * Requires VITE_RAPIDAPI_KEY environment variable
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artist } = req.query;

    if (!artist || typeof artist !== 'string') {
      return res.status(400).json({ error: 'Artist name is required' });
    }

    const apiKey = process.env.VITE_RAPIDAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Shazam API not configured',
        details: 'Set VITE_RAPIDAPI_KEY environment variable',
      });
    }

    // Search for artist
    const response = await fetch(
      `https://shazam-core.p.rapidapi.com/v2/artists/search?query=${encodeURIComponent(artist)}&limit=1`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'shazam-core.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shazam API error:', errorText);
      return res.status(response.status).json({
        error: 'Shazam API error',
        details: errorText,
      });
    }

    const data = await response.json();
    const artistData = data?.artists?.hits?.[0]?.artist;

    if (!artistData) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Extract social links
    const socialLinks: Record<string, string> = {};
    const weblinks = artistData.weblinks || [];

    for (const link of weblinks) {
      if (link.type === 'TWITTER') {
        socialLinks.twitter = link.url;
      } else if (link.type === 'INSTAGRAM') {
        socialLinks.instagram = link.url;
      } else if (link.type === 'FACEBOOK') {
        socialLinks.facebook = link.url;
      } else if (link.type === 'YOUTUBE_CHANNEL') {
        socialLinks.youtube = link.url;
      } else if (link.type === 'TIKTOK') {
        socialLinks.tiktok = link.url;
      } else if (link.type === 'SOUNDCLOUD') {
        socialLinks.soundcloud = link.url;
      } else if (link.type === 'BANDCAMP') {
        socialLinks.bandcamp = link.url;
      }
    }

    return res.status(200).json({
      name: artistData.name,
      avatar: artistData.avatar,
      verified: artistData.verified,
      socialLinks,
    });
  } catch (error) {
    console.error('Artist info error:', error);
    return res.status(500).json({
      error: 'Failed to fetch artist info',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
