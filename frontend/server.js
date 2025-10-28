import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Backend proxy server for Shazam API calls to keep API keys secure and handle CORS
// Located here as a separate Express server since this is a Vite React app (not Next.js)
// Migration options: 1) Keep as is, 2) Move to serverless functions (Vercel/Netlify), 3) Migrate to Next.js API routes
const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

// Analyze audio endpoint
app.post('/api/analyze-audio', upload.single('file'), async (req, res) => {
  try {
    console.log('Starting audio analysis request...');

    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create FormData for Shazam API
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('file', blob, file.originalname || 'audio.webm');
    const response = await fetch('https://shazam-core.p.rapidapi.com/v1/tracks/recognize', {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': process.env.VITE_RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'shazam-core.p.rapidapi.com',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shazam API error:', errorText);
      return res.status(response.status).json({
        error: 'Shazam API error',
        details: errorText
      });
    }

    const result = await response.json();

    // Fetch artist social links if we have a track
    let artistInfo = null;
    if (result?.track?.subtitle) {
      try {
        const artistName = result.track.subtitle;
        const artistInfoResponse = await fetch(
          `http://localhost:5174/api/artist-info?artist=${encodeURIComponent(artistName)}`
        );

        if (artistInfoResponse.ok) {
          artistInfo = await artistInfoResponse.json();
        }
      } catch (error) {
        console.error('Failed to fetch artist info:', error);
        // Continue without artist info if it fails
      }
    }

    return res.json({ ...result, artistInfo });
  } catch (error) {
    console.error('Audio analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to analyze audio',
      details: errorMessage
    });
  }
});

// Artist info endpoint
app.get('/api/artist-info', async (req, res) => {
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

    return res.json({
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
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
