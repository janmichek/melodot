export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artist } = req.query;

    if (!artist) {
      return res.status(400).json({ error: 'Artist name is required' });
    }

    const response = await fetch(
      `https://shazam-core.p.rapidapi.com/v2/artists/search?query=${encodeURIComponent(artist)}&limit=1`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.VITE_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'shazam-core.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shazam API error:', errorText);
      return res.status(response.status).json({
        error: 'Shazam API error',
        details: errorText
      });
    }

    const data = await response.json();
    const artistData = data?.artists?.hits?.[0]?.artist;

    if (!artistData) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Extract social links
    const socialLinks = {};
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
      }
    }

    return res.status(200).json({
      name: artistData.name,
      avatar: artistData.avatar,
      verified: artistData.verified,
      socialLinks
    });
  } catch (error) {
    console.error('Artist info error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to fetch artist info',
      details: errorMessage
    });
  }
}