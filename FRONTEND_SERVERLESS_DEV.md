# Frontend Development with Serverless Functions

Complete guide for developing your frontend with serverless API functions using `vercel dev`.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [API Endpoints](#api-endpoints)
4. [Environment Variables](#environment-variables)
5. [Local Development Workflow](#local-development-workflow)
6. [Testing API Endpoints](#testing-api-endpoints)
7. [Debugging](#debugging)
8. [Frontend Integration](#frontend-integration)
9. [Deployment](#deployment)

---

## Quick Start

### 1. Install Vercel CLI

```bash
npm install -g vercel
# or with bun:
bun add -g vercel
```

### 2. Set Up Environment Variables

Create `.env.local` in the root directory:

```env
# Shazam API (from RapidAPI)
VITE_RAPIDAPI_KEY=your_rapidapi_key_here

# Spotify OAuth
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### 3. Start Local Development Server

```bash
cd /Users/yeahboi/DEV/shaz
vercel dev
```

Your application will be available at **http://localhost:3000**:
- Frontend: React app (with hot reload)
- API: All serverless functions in `/api`

### 4. Test the API

```bash
# In another terminal
curl -X POST http://localhost:3000/api/analyze-audio \
  -F "file=@/path/to/audio.mp3"
```

---

## Architecture Overview

### Traditional Express Server vs Serverless

**Before (Express server.js):**
```
Client → Express Server (single process)
         ├── /api/analyze-audio
         ├── /api/artist-info
         ├── /api/spotify/login
         ├── /api/spotify/callback
         └── /api/spotify/profile
```

**After (Serverless functions):**
```
Client → Vercel Platform
         ├── /api/analyze-audio.ts    (separate function)
         ├── /api/artist-info.ts      (separate function)
         ├── /api/spotify/login.ts    (separate function)
         ├── /api/spotify/callback.ts (separate function)
         └── /api/spotify/profile.ts  (separate function)
```

### Key Differences

| Aspect | Express | Serverless |
|--------|---------|-----------|
| Server | Always running | Cold start (first request) |
| Memory | Persistent | Stateless |
| Sessions | In-memory Map | Must use client-side or DB |
| Scaling | Manual | Automatic |
| Cost | Monthly | Pay per request |
| Local Dev | `npm start` | `vercel dev` |

---

## API Endpoints

All endpoints are serverless functions in the `/api` folder. They mirror the original Express endpoints but are stateless.

### 1. POST `/api/analyze-audio`

Analyzes audio file using Shazam API and returns track metadata.

**Request:**
```bash
curl -X POST http://localhost:3000/api/analyze-audio \
  -F "file=@recording.webm"
```

**Response:**
```json
{
  "track": {
    "title": "Song Name",
    "subtitle": "Artist Name",
    "images": { "coverart": "https://..." },
    "sections": [...],
    ...
  },
  "artistInfo": {
    "name": "Artist Name",
    "socialLinks": { ... }
  }
}
```

**File:** `api/analyze-audio.ts`

---

### 2. GET `/api/artist-info`

Fetches artist information from Shazam.

**Request:**
```bash
curl "http://localhost:3000/api/artist-info?artist=Taylor%20Swift"
```

**Response:**
```json
{
  "name": "Taylor Swift",
  "avatar": "https://...",
  "verified": true,
  "socialLinks": {
    "twitter": "https://twitter.com/...",
    "instagram": "https://instagram.com/...",
    ...
  }
}
```

**File:** `api/artist-info.ts`

---

### 3. POST `/api/spotify/login`

Initiates Spotify OAuth login flow.

**Request:**
```bash
curl -X POST http://localhost:3000/api/spotify/login
```

**Response:**
```json
{
  "authUrl": "https://accounts.spotify.com/authorize?...",
  "state": "random_state_string"
}
```

**File:** `api/spotify/login.ts`

---

### 4. POST `/api/spotify/callback`

Exchanges Spotify authorization code for access token.

**Request:**
```bash
curl -X POST http://localhost:3000/api/spotify/callback \
  -H "Content-Type: application/json" \
  -d '{"code":"authorization_code_from_spotify"}'
```

**Response:**
```json
{
  "accessToken": "spotify_access_token",
  "refreshToken": "spotify_refresh_token",
  "expiresIn": 3600
}
```

**File:** `api/spotify/callback.ts`

**Important:** Tokens should be stored securely on the client (in memory or secure cookies). See "Session Management" section below.

---

### 5. GET `/api/spotify/profile`

Fetches user profile from Spotify using access token.

**Request:**
```bash
curl "http://localhost:3000/api/spotify/profile?accessToken=your_access_token"
```

**Response:**
```json
{
  "id": "spotify_user_id",
  "displayName": "User Name",
  "email": "user@example.com",
  "country": "US",
  "followers": 1234,
  "images": [...],
  ...
}
```

**File:** `api/spotify/profile.ts`

---

## Environment Variables

### Local Development (.env.local)

```env
# Shazam API (get from https://rapidapi.com/apidojo/api/shazam-core)
VITE_RAPIDAPI_KEY=your_key_here

# Spotify OAuth (get from https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

# Optional: Custom frontend URL
FRONTEND_URL=http://localhost:3000
```

### Production (Vercel Dashboard)

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add all the above variables
4. Redeploy the project

**Note:** `VITE_RAPIDAPI_KEY` prefix allows frontend to access it as well for other purposes.

---

## Local Development Workflow

### Setup (One-time)

```bash
# 1. Clone repo (already done)
cd /Users/yeahboi/DEV/shaz

# 2. Install dependencies
bun install

# 3. Create .env.local
cat > .env.local << EOF
VITE_RAPIDAPI_KEY=your_key
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
EOF

# 4. Start dev server
vercel dev
```

### Daily Development (Multiple Terminals)

**Terminal 1 - Run Local Dev Server**
```bash
cd /Users/yeahboi/DEV/shaz
vercel dev
# Listens on http://localhost:3000
# Auto-reloads on file changes
```

**Terminal 2 - View Frontend**
```bash
open http://localhost:3000
```

**Terminal 3 - Edit Files & Test**
```bash
# Edit api/analyze-audio.ts
vim api/analyze-audio.ts

# Save file
# vercel dev auto-reloads

# Test the change
curl -X POST http://localhost:3000/api/analyze-audio \
  -F "file=@test.webm"
```

---

## Testing API Endpoints

### Option 1: Using curl (Command Line)

```bash
# Test audio analysis
curl -X POST http://localhost:3000/api/analyze-audio \
  -F "file=@recording.webm"

# Test artist info
curl "http://localhost:3000/api/artist-info?artist=Taylor%20Swift"

# Test Spotify login
curl -X POST http://localhost:3000/api/spotify/login
```

### Option 2: Using the Test Script

```bash
./api/test-api.sh http://localhost:3000/api/analyze-audio
```

### Option 3: Using Frontend

1. Open http://localhost:3000
2. Click "Record Audio" button
3. Grant microphone permission
4. Record audio (2+ seconds)
5. Submit - it will call `/api/analyze-audio`
6. Check browser DevTools → Network tab to see the request/response

### Option 4: Using Postman/Insomnia

1. Open Postman or Insomnia
2. Create a POST request to `http://localhost:3000/api/analyze-audio`
3. Select Body → form-data
4. Add key: `file`, value: select your audio file
5. Send

---

## Debugging

### View Server Logs

All API logs appear in Terminal 1 where `vercel dev` is running:

```bash
$ vercel dev
> Vercel CLI 48.x.x
Listening on http://localhost:3000

# When you make a request:
[analyze-audio] POST /api/analyze-audio 200 1234ms
```

### Add Logging to API

Edit `api/analyze-audio.ts`:

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('📝 Received request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
  });

  // ... process request ...

  console.log('✅ Sending response:', result);
  return res.json(result);
}
```

Output in Terminal 1:
```
📝 Received request: { method: 'POST', url: '/api/analyze-audio', ... }
✅ Sending response: { track: { ... } }
```

### Check Browser Network Tab

1. Open http://localhost:3000
2. Press F12 to open DevTools
3. Go to Network tab
4. Make a request (record audio, click submit)
5. Click on the `/api/analyze-audio` request
6. View:
   - **Headers**: Request method, content-type, headers
   - **Payload**: Multipart form data with file
   - **Response**: JSON from API
   - **Timing**: Request duration

---

## Frontend Integration

### How Frontend Calls API

In `frontend/src/components/AudioRecorder.tsx` (line 81):

```typescript
const response = await fetch('/api/analyze-audio', {
  method: 'POST',
  body: formData  // Audio file
});

const data = await response.json();
// data.track contains song info
// data.artistInfo contains artist info
```

### Update API Calls

When you create new endpoints, update the frontend:

```typescript
// Old: Express server
fetch('http://localhost:5174/api/analyze-audio')

// New: Serverless function
fetch('/api/analyze-audio')  // Same domain, different path
```

With `vercel dev`, both frontend and API are on **same domain** (`localhost:3000`), so relative paths work.

---

## Session Management

### ⚠️ Important: Serverless Limitations

Express server used in-memory Map for sessions:
```javascript
const sessions = new Map();
sessions.set(sessionId, { accessToken, refreshToken });
```

**Serverless functions are stateless** - each request is independent. You have options:

### Option 1: Client-Side Storage (Recommended for Development)

Store tokens in the browser:

```typescript
// After Spotify OAuth callback
const response = await fetch('/api/spotify/callback', { ... });
const { accessToken, refreshToken } = await response.json();

// Store in browser
localStorage.setItem('spotifyToken', accessToken);
localStorage.setItem('spotifyRefresh', refreshToken);

// Use later
const token = localStorage.getItem('spotifyToken');
await fetch(`/api/spotify/profile?accessToken=${token}`);
```

**Pros:** Simple, works with serverless
**Cons:** Not secure for sensitive data

### Option 2: Secure Cookies

Use HttpOnly cookies (server sets, client can't read):

```typescript
// api/spotify/callback.ts
res.setHeader('Set-Cookie', `spotifyToken=${accessToken}; HttpOnly; Secure`);
res.json({ success: true });

// Browser automatically sends cookie in next request
// API can read from req.cookies.spotifyToken
```

**Pros:** Secure, works with serverless
**Cons:** Need cookie middleware

### Option 3: Database (Production)

Use Vercel KV or MongoDB:

```typescript
// api/spotify/callback.ts
import { kv } from '@vercel/kv';

const sessionId = generateId();
await kv.set(`session:${sessionId}`, {
  accessToken,
  refreshToken,
  expiresAt: Date.now() + 3600000
});

res.json({ sessionId });

// Later: api/spotify/profile.ts
const session = await kv.get(`session:${sessionId}`);
```

**Pros:** Persistent, scalable, secure
**Cons:** Requires database setup

### Current Implementation

Our implementation returns tokens to the client:

```typescript
// api/spotify/callback.ts returns:
{
  "accessToken": "token",
  "refreshToken": "token",
  "expiresIn": 3600
}
```

Frontend should store these securely (localStorage or state management).

---

## Deployment

### 1. Commit Changes

```bash
git add api/ frontend/
git commit -m "Move server.js endpoints to serverless functions"
git push origin main
```

### 2. Vercel Auto-Deploys

Vercel automatically:
1. Clones your repository
2. Installs dependencies
3. Builds the frontend
4. Deploys API functions
5. Your site is live in 2-5 minutes

### 3. Verify Deployment

```bash
# Check status
open https://vercel.com/dashboard

# Test production API
curl -X POST https://your-domain.vercel.app/api/analyze-audio \
  -F "file=@audio.mp3"
```

### 4. Set Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from `.env.local`
5. Redeploy: Click "Redeploy" button

---

## Comparing Express vs Serverless

### Express Server (server.js)

```typescript
import express from 'express';

const app = express();

app.post('/api/analyze-audio', async (req, res) => {
  // Handle request
});

app.listen(5174);
```

**Pros:**
- Server always running
- Shared state (sessions in Map)
- Full control

**Cons:**
- Must run separate server
- Manual scaling
- More complex deployment

### Serverless Functions

```typescript
// api/analyze-audio.ts
export default async function handler(req, res) {
  // Handle request
}
```

**Pros:**
- Auto-scaling
- Only pay for execution time
- Simple deployment
- Works with Vercel

**Cons:**
- Stateless (no in-memory storage)
- Cold start delay
- Function timeout limits

---

## Summary

✅ **Your Setup:**
- Local: `vercel dev` runs both frontend and API
- Development: Edit files, auto-reload
- Testing: Use curl, browser, or test script
- Deployment: Push to GitHub, Vercel auto-deploys

✅ **API Endpoints:**
- `/api/analyze-audio` - Audio recognition via Shazam
- `/api/artist-info` - Artist metadata via Shazam
- `/api/spotify/login` - Start OAuth flow
- `/api/spotify/callback` - Complete OAuth flow
- `/api/spotify/profile` - Get user profile

✅ **Development Workflow:**
1. `vercel dev` in Terminal 1
2. Edit files in Terminal 2
3. Test API in Terminal 3
4. Auto-reload on save
5. `git push` to deploy

**Next Steps:**
1. ✅ Verify `.env.local` is configured
2. ✅ Run `vercel dev`
3. ✅ Test API endpoints
4. ✅ Build frontend features
5. ✅ Commit and deploy

Happy coding! 🚀
