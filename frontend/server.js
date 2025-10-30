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

// In-memory session storage (for production, use Redis or a database)
const sessions = new Map();

// Spotify OAuth configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Analyze audio endpoint
app.post('/api/analyze-audio', upload.single('file'), async (req, res) => {
  try {
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

// Spotify OAuth - Login endpoint
app.post('/api/spotify/login', (req, res) => {
  try {
    if (!SPOTIFY_CLIENT_ID) {
      return res.status(500).json({ error: 'Spotify client ID not configured' });
    }

    const state = Math.random().toString(36).substring(7);
    const scope = 'user-read-private user-read-email';

    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: state,
    })}`;

    res.json({ authUrl, state });
  } catch (error) {
    console.error('Spotify login error:', error);
    res.status(500).json({ error: 'Failed to initiate login' });
  }
});

// Spotify OAuth - Callback endpoint
app.post('/api/spotify/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Spotify credentials not configured' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Spotify token error:', errorText);
      return res.status(tokenResponse.status).json({ error: 'Failed to get access token' });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Generate session ID
    const sessionId = Math.random().toString(36).substring(7) + Date.now().toString(36);

    // Store session
    sessions.set(sessionId, {
      accessToken: access_token,
      refreshToken: refresh_token,
      createdAt: Date.now(),
    });

    res.json({ sessionId });
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.status(500).json({ error: 'Failed to complete authentication' });
  }
});

// Spotify - Get user profile
app.get('/api/spotify/profile', async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Fetch user profile from Spotify
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      sessions.delete(sessionId);
      return res.status(profileResponse.status).json({ error: 'Failed to fetch profile' });
    }

    const profile = await profileResponse.json();

    res.json({
      id: profile.id,
      displayName: profile.display_name,
      email: profile.email,
      country: profile.country,
      product: profile.product,
      followers: profile.followers?.total || 0,
      images: profile.images || [],
      uri: profile.uri,
    });
  } catch (error) {
    console.error('Spotify profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
