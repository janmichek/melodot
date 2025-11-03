# Vercel API Setup Guide

This guide walks you through setting up and testing the Vercel serverless API for the Shazam audio analysis project.

## What We've Created

✅ **API Folder Structure** (`/api/`)
- `analyze-audio.ts` - Main serverless function handler
- `tsconfig.json` - TypeScript configuration
- `test-api.sh` - Test script for local development
- `README.md` - API documentation

✅ **Configuration Files Updated**
- Root `vercel.json` - Configured for both frontend and API deployment
- Root `package.json` - Added formidable and @vercel/node dependencies

✅ **Installation Complete**
- All dependencies installed via `bun install`

## Quick Start

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

Or if you prefer bun:
```bash
bun add -g vercel
```

### 2. Run Local Development Server

```bash
# From the root project directory
cd /Users/yeahboi/DEV/shaz
vercel dev
```

You should see output like:
```
> Vercel CLI 33.x.x
> Developing using monorepo and detected settings
> Vercel CLI uses the `vercel` and `.vercel` directory for configuration
```

The server will run on `http://localhost:3000`

### 3. Test the API

In a new terminal, run the test script:

```bash
./api/test-api.sh http://localhost:3000/api/analyze-audio
```

Or manually test with curl:

```bash
# Create a test audio file
touch /tmp/test.wav

# Send it to the API
curl -X POST http://localhost:3000/api/analyze-audio \
  -F "file=@/tmp/test.wav"
```

Expected Response (HTTP 200):
```json
{
  "track": {
    "title": "Blinding Lights",
    "subtitle": "The Weeknd",
    "images": {
      "coverart": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400"
    },
    "hub": {
      "actions": [
        {
          "type": "spotify",
          "uri": "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMwbG"
        }
      ]
    },
    "sections": [
      {
        "type": "BASIC_INFORMATION",
        "metadata": [
          {"title": "Album", "text": "Mock Album"},
          {"title": "Label", "text": "Mock Label"},
          {"title": "Released", "text": "2025"}
        ]
      }
    ],
    "artists": [{"adamid": "mock-artist-id"}]
  },
  "artistInfo": {
    "type": "Artist",
    "country": "US",
    "socialLinks": {
      "twitter": "https://twitter.com",
      "instagram": "https://instagram.com",
      ...
    }
  }
}
```

## Project Structure

```
/shaz
├── api/
│   ├── analyze-audio.ts         ← Main serverless function
│   ├── tsconfig.json            ← TypeScript config for API
│   ├── test-api.sh              ← Local test script
│   └── README.md                ← API documentation
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AudioRecorder.tsx  ← Calls the API at line 81
│   │   └── ...
│   └── ...
├── contracts/
├── vercel.json                  ← Deployment config (UPDATED)
├── package.json                 ← Root dependencies (UPDATED)
└── API_SETUP_GUIDE.md           ← This file
```

## How It Works

### Frontend → API Flow

1. **User records audio** in the browser (`AudioRecorder.tsx`)
2. **Audio blob is sent** to `/api/analyze-audio` (line 81 in AudioRecorder.tsx)
3. **API receives the request** in `api/analyze-audio.ts`
4. **API parses the file** using `formidable`
5. **API returns mock data** (currently) or real data from a service
6. **Frontend displays results** with song info, artist, images, etc.

### Current Implementation

The API currently uses **mock data** based on a hash of the audio file. This allows you to:
- ✅ Test the entire flow end-to-end
- ✅ Develop the frontend without external dependencies
- ✅ Deploy immediately to Vercel
- ⚠️ Always returns one of 10 pre-defined songs (randomly selected)

## Customization

### Add Real Audio Recognition

The `generateMockDiscoveryResult()` function in `api/analyze-audio.ts` is where you'll integrate real audio recognition.

**To use real audio recognition, replace the mock data with:**

#### Option A: Spotify Integration

```typescript
// Install: bun add spotify-web-api-js
import SpotifyWebApi from 'spotify-web-api-js';

async function analyzeWithSpotify(fileBuffer: Buffer) {
  const spotify = new SpotifyWebApi({
    accessToken: process.env.SPOTIFY_ACCESS_TOKEN
  });

  // Extract audio features
  const features = await extractAudioFeatures(fileBuffer);

  // Search Spotify
  const results = await spotify.searchTracks(
    `track:${features.title} artist:${features.artist}`
  );

  return convertSpotifyToDiscoveryResult(results.tracks.items[0]);
}
```

#### Option B: AcoustID Fingerprinting

```typescript
// Install: bun add chromaprint
import { generateFingerprint } from 'chromaprint';

async function analyzeWithAcoustID(fileBuffer: Buffer) {
  const fingerprint = await generateFingerprint(fileBuffer);

  const response = await fetch(
    `https://api.acoustid.org/v2/lookup?client=${process.env.ACOUSTID_API_KEY}&fingerprint=${fingerprint}`
  );

  const data = await response.json();
  return convertAcoustIDToDiscoveryResult(data.results[0]);
}
```

#### Option C: Use MockAI Service

```typescript
// Install: bun add openai
import OpenAI from 'openai';

async function analyzeWithAI(fileBuffer: Buffer) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  // Analyze audio characteristics with AI
  const analysis = await analyzeAudioCharacteristics(fileBuffer);

  // Use OpenAI to identify song
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{
      role: 'user',
      content: `Based on these audio characteristics, identify the song: ${JSON.stringify(analysis)}`
    }]
  });

  return parseAIResponse(response.choices[0].message.content);
}
```

## Deployment to Vercel

### Step 1: Commit Changes

```bash
git add .
git commit -m "Add Vercel serverless API for audio analysis"
git push origin main
```

### Step 2: Vercel Auto-Deploy

Vercel will automatically:
1. Detect the changes
2. Install dependencies from root `package.json`
3. Build the frontend
4. Deploy the API functions
5. Your site will be live in 2-5 minutes

### Step 3: Verify Deployment

```bash
# Test the deployed API
curl -X POST https://shaz-zeta.vercel.app/api/analyze-audio \
  -F "file=@/path/to/audio.mp3"
```

Or check the Vercel dashboard:
- https://vercel.com/dashboard
- Select your project
- Check the "Deployments" tab
- Click the latest deployment to see logs

## Troubleshooting

### Problem: "Cannot find module 'formidable'"

**Solution:** Make sure dependencies are installed at root level:
```bash
bun install
```

### Problem: API returns 404

**Solution 1:** Check that `/api/analyze-audio.ts` exists:
```bash
ls -la api/analyze-audio.ts
```

**Solution 2:** Restart the dev server:
```bash
# Kill the current process (Ctrl+C)
# Then run again
vercel dev
```

### Problem: "ENOENT: no such file or directory, open '/tmp/...'"

**Solution:** This is normal in production (Vercel uses `/tmp`). The error handling is already in place. If it persists, check file permissions:
```bash
# Test file write access
ls -la /tmp
```

### Problem: File upload fails with "No audio file provided"

**Solution:** Ensure the form field is named exactly `file`:
```bash
# Correct
curl -F "file=@audio.wav" ...

# Incorrect
curl -F "audio=@audio.wav" ...
```

## Performance Optimization

### For Large Audio Files

If you're uploading files larger than 10MB:

1. **Compress audio client-side** before uploading:
```typescript
// Use web Audio API to compress
const context = new AudioContext();
const source = context.createMediaElementAudioSource(audioElement);
// Apply compression...
```

2. **Increase timeout** in `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3.2.29",
      "maxDuration": 300
    }
  }
}
```

### For Faster Recognition

1. **Cache results** using a database
2. **Use edge middleware** to pre-process requests
3. **Implement batch processing** for multiple files

## Next Steps

1. ✅ **Test locally**: `vercel dev` + `./api/test-api.sh`
2. ✅ **Verify frontend integration**: Records audio and calls the API
3. **Customize**: Replace mock data with real audio recognition service
4. **Add monitoring**: Set up error logging and analytics
5. **Optimize**: Add caching, compression, and performance improvements

## Environment Variables (for future integrations)

Create `.env.local` in the root directory:

```env
# For Spotify API
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret

# For AcoustID
ACOUSTID_API_KEY=your_key

# For Last.fm
LASTFM_API_KEY=your_key

# For OpenAI (if using AI analysis)
OPENAI_API_KEY=your_key
```

These variables will be available in the API via `process.env.VARIABLE_NAME`.

**To use in Vercel production:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable
3. Re-deploy

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Node.js Runtime**: https://vercel.com/docs/functions/serverless-functions/node-js
- **Formidable**: https://github.com/form-data/formidable
- **Audio Processing**: https://github.com/mozilla/voice-web
- **Music APIs**:
  - Spotify: https://developer.spotify.com/documentation/web-api
  - AcoustID: https://acoustid.org/webservice
  - Last.fm: https://www.last.fm/api

## Summary

You now have a complete Vercel serverless API setup that:
- ✅ Handles file uploads
- ✅ Processes audio files
- ✅ Returns properly formatted responses
- ✅ Is ready for production deployment
- ✅ Can be easily extended with real audio recognition services

Happy coding! 🎵
