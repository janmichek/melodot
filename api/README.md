# Shazam API - Vercel Serverless Functions

This directory contains serverless functions for the Shazam music discovery application, deployed on Vercel.

## Overview

The API provides endpoints for audio analysis and music identification. Currently, it uses a mock data implementation to allow frontend development without requiring external service integrations.

## Current Endpoints

### POST `/api/analyze-audio`

Accepts an audio file and returns music metadata.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Audio file in `file` field (max 50MB)

**Response:**
```json
{
  "track": {
    "title": "Song Title",
    "subtitle": "Artist Name",
    "images": {
      "coverart": "https://image-url.jpg"
    },
    "hub": {
      "actions": [
        {
          "type": "spotify",
          "uri": "https://open.spotify.com/track/..."
        }
      ]
    },
    "sections": [
      {
        "type": "BASIC_INFORMATION",
        "metadata": [
          {
            "title": "Album",
            "text": "Album Name"
          }
        ]
      }
    ],
    "artists": [
      {
        "adamid": "artist-id"
      }
    ]
  },
  "artistInfo": {
    "type": "Artist",
    "country": "US",
    "socialLinks": {
      "twitter": "https://twitter.com/...",
      "instagram": "https://instagram.com/...",
      "facebook": "https://facebook.com/...",
      "youtube": "https://youtube.com/...",
      "tiktok": "https://tiktok.com/...",
      "soundcloud": "https://soundcloud.com/...",
      "bandcamp": "https://bandcamp.com/...",
      "website": "https://example.com"
    }
  }
}
```

## Local Development

### 1. Install Dependencies

```bash
# From project root
bun install
```

### 2. Run Local API with Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run local development server
vercel dev
```

The API will be available at `http://localhost:3000/api/analyze-audio`

### 3. Test the API

Using curl:
```bash
curl -X POST http://localhost:3000/api/analyze-audio \
  -F "file=@path/to/audio.mp3"
```

Using Node.js:
```javascript
const form = new FormData();
form.append('file', audioBlob, 'recording.webm');

const response = await fetch('http://localhost:3000/api/analyze-audio', {
  method: 'POST',
  body: form
});

const data = await response.json();
console.log(data);
```

## Integration with Real Audio Services

The current implementation uses mock data. To integrate with real audio recognition services, modify the `generateMockDiscoveryResult()` function in `analyze-audio.ts`.

### Option 1: Spotify Web API

Requires: Spotify Developer App credentials

```typescript
const spotifyToken = await getSpotifyAccessToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
const features = await getAudioFeatures(spotifyToken, fileBuffer);
const trackData = await searchTrack(spotifyToken, features);
```

### Option 2: AcoustID / MusicBrainz

Requires: AcoustID API key

```typescript
const fingerprint = await generateAcoustIDFingerprint(fileBuffer);
const results = await lookupAcoustID(fingerprint, process.env.ACOUSTID_API_KEY);
const trackData = await getMusicBrainzData(results[0].id);
```

### Option 3: Last.fm

Requires: Last.fm API key

```typescript
const metadata = await extractAudioMetadata(fileBuffer);
const trackInfo = await lastfm.track.getInfo({
  track: metadata.title,
  artist: metadata.artist,
  api_key: process.env.LASTFM_API_KEY
});
```

### Option 4: AWS Rekognition (Requires custom setup)

Requires: AWS credentials and IAM permissions

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Spotify (if integrating with Spotify)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# AcoustID (if integrating with AcoustID)
ACOUSTID_API_KEY=your_api_key

# Last.fm (if integrating with Last.fm)
LASTFM_API_KEY=your_api_key

# AWS (if using AWS Rekognition)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

## Deployment to Vercel

### Prerequisites
- Vercel account connected to your GitHub repository
- Dependencies installed: `bun install`

### Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Vercel serverless API"
   git push origin main
   ```

2. **Vercel Automatic Deployment:**
   - Vercel will automatically detect changes
   - It will build the frontend and deploy the API
   - Your API will be available at `https://your-domain.vercel.app/api/analyze-audio`

3. **Or Deploy Manually:**
   ```bash
   vercel deploy --prod
   ```

### Verify Deployment

```bash
# Test the deployed API
curl -X POST https://your-domain.vercel.app/api/analyze-audio \
  -F "file=@path/to/audio.mp3"
```

## Project Structure

```
/api
├── analyze-audio.ts      # Main audio analysis endpoint
└── README.md             # This file

# The frontend calls this endpoint at:
# frontend/src/components/AudioRecorder.tsx
# Line 81: fetch('/api/analyze-audio', { method: 'POST', body: formData })
```

## Dependencies

- `formidable`: Parse multipart form data and file uploads
- `@vercel/node`: Vercel Node.js runtime types

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (missing file)
- `405`: Method not allowed
- `500`: Server error (with error details)

## Performance Notes

- Max file size: 50MB
- Temp files are automatically cleaned up
- Request timeout: Depends on Vercel plan (default 60 seconds)

## Next Steps

1. **Testing**: Use the local development server to test
2. **Integration**: Integrate with your preferred audio recognition service
3. **Environment Variables**: Set up secrets in Vercel dashboard
4. **Monitoring**: Use Vercel Analytics to monitor API performance

## Troubleshooting

### API returns 404

**Issue**: `/api/analyze-audio` endpoint not found

**Solutions**:
- Ensure `vercel.json` has the correct `functions` configuration
- Verify the file is named `analyze-audio.ts` in the `/api` folder
- Check that you've run `bun install` in the root directory

### File upload fails

**Issue**: "No audio file provided" error

**Solutions**:
- Ensure the form field is named `file`
- Check file size doesn't exceed 50MB
- Verify Content-Type is `multipart/form-data`

### Timeout errors

**Issue**: Request times out

**Solutions**:
- Reduce file size
- Optimize audio processing (if using real recognition service)
- Consider using a queued job system for large files

## Support

For issues or questions, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Formidable Documentation](https://github.com/form-data/formidable)
- [Node.js Documentation](https://nodejs.org/docs/)
