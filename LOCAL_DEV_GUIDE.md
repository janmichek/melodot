# Local Development with Serverless Functions

## ✅ Yes! Use Serverless Functions Locally

You can develop and test your API locally using **`vercel dev`**, which emulates the Vercel serverless environment exactly as it runs in production.

---

## Quick Start (3 Steps)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
# or with bun:
bun add -g vercel
```

### Step 2: Start Local Dev Server

```bash
cd /Users/yeahboi/DEV/shaz
vercel dev
```

**Expected output:**
```
> Vercel CLI 33.x.x
> Developing using detected settings
> Found vercel.json
> Project created in Vercel Workspace
Listening on http://localhost:3000
```

### Step 3: Test in Two Terminals

**Terminal 1** (already running from Step 2):
```
vercel dev
```

**Terminal 2** (new terminal):
```bash
# Test the API endpoint
curl -X POST http://localhost:3000/api/analyze-audio \
  -F "file=@/tmp/test.wav"

# Or run the test script
./api/test-api.sh http://localhost:3000/api/analyze-audio

# Or test from browser
# Go to http://localhost:3000 and use the frontend
```

---

## What `vercel dev` Does

```
Your Machine:
  Port 3000
  ├── Frontend (React dev server from Vite)
  │   └── Serves your React app
  │       Hot reload: ✅ Works
  │
  └── API Functions (Node.js emulator)
      └── /api/analyze-audio.ts
          Hot reload: ✅ Works
          Environment: Same as production
```

**Key Benefits:**
- ✅ Frontend and API run together locally
- ✅ Changes to code auto-reload
- ✅ Same environment as production
- ✅ Test the full integration
- ✅ No need to deploy to test

---

## Development Workflow

### Typical Dev Session

```bash
# Terminal 1: Start local server
cd /Users/yeahboi/DEV/shaz
vercel dev

# Keep this running...
# Vercel watches for file changes and auto-reloads

# Terminal 2: Test or develop
# Make changes to api/analyze-audio.ts
# Changes auto-reload in vercel dev
# Test your changes immediately

# Terminal 3: Optional - run tests
./api/test-api.sh http://localhost:3000/api/analyze-audio
```

### Edit → Test → Repeat

1. **Edit** `api/analyze-audio.ts`
2. **Save** the file
3. **Reload** browser or re-run curl command
4. **See changes** immediately (no rebuild needed)

---

## How to Test the API Locally

### Option 1: Using the Test Script (Easiest)

```bash
./api/test-api.sh http://localhost:3000/api/analyze-audio
```

Output:
```
Testing Audio Analysis API
API URL: http://localhost:3000/api/analyze-audio

✓ API is reachable
✓ Correctly returned 400 for missing file
✓ Test audio file created: /tmp/test-audio.wav
✓ API successfully processed audio file (HTTP 200)
Response: {
  "track": {
    "title": "Blinding Lights",
    "subtitle": "The Weeknd",
    ...
  }
}
✓ Test complete
```

### Option 2: Using curl

```bash
# Create a test audio file
touch /tmp/test.wav

# Send to API
curl -X POST http://localhost:3000/api/analyze-audio \
  -F "file=@/tmp/test.wav"

# Expected response (HTTP 200):
# {
#   "track": { ... },
#   "artistInfo": { ... }
# }
```

### Option 3: Using the Frontend UI

1. Open http://localhost:3000 in your browser
2. Click the microphone button
3. Grant microphone permission
4. Record some audio (2+ seconds)
5. The frontend will call `/api/analyze-audio`
6. See results displayed on screen
7. Open browser DevTools (F12) → Network tab to see the request

---

## Debugging the API Locally

### View Server Logs

When you run `vercel dev`, all logs appear in Terminal 1:

```bash
$ vercel dev

> Vercel CLI 33.x.x
Listening on http://localhost:3000

# When you make a request:
> POST /api/analyze-audio 200 1234ms
```

### Add Console Logging

Edit `api/analyze-audio.ts`:

```typescript
export default async function handler(req, res) {
  console.log('📝 Received request:', req.method);
  console.log('📁 Files:', Object.keys(files));

  const uploadedFile = files.file?.[0];
  if (!uploadedFile) {
    console.log('❌ No file uploaded');
    return res.status(400).json({ error: 'No audio file provided' });
  }

  console.log('✅ File received:', uploadedFile.originalFilename);
  console.log('📊 File size:', uploadedFile.size, 'bytes');

  // ... rest of code

  console.log('✅ Returning response');
  return res.status(200).json(mockResult);
}
```

Now when you test:
```
Terminal 1 (vercel dev) shows:
  📝 Received request: POST
  📁 Files: [ 'file' ]
  ✅ File received: test.wav
  📊 File size: 1024 bytes
  ✅ Returning response
```

### Check Request/Response in Browser

1. Open http://localhost:3000
2. Open DevTools: F12 → Network tab
3. Make a request (record audio)
4. Click on the request to see:
   - **Headers**: Request method, content-type, etc.
   - **Payload**: Multipart form data with file
   - **Response**: JSON from API

---

## Modify and Test in Real-Time

### Example: Change Mock Data

**Before:**
```typescript
const song = mockSongs[songIndex];
// Returns one of 10 songs
```

**After:**
```typescript
const song = {
  title: 'Always Testing',
  artist: 'Dev Mode',
  albumCover: 'https://...',
  spotifyUri: 'https://...'
};
// Always returns this song
```

**Steps:**
1. Edit `api/analyze-audio.ts`
2. Save the file
3. `vercel dev` auto-reloads
4. Test again: `./api/test-api.sh http://localhost:3000/api/analyze-audio`
5. See "Always Testing" returned instead of random songs

---

## Troubleshooting Local Development

### Issue: "Cannot find module 'formidable'"

**Solution:**
```bash
# Ensure dependencies are installed
bun install

# or reinstall
bun install --force
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Run on different port
vercel dev --listen 3001

# Then test on new port
curl -X POST http://localhost:3001/api/analyze-audio ...
```

### Issue: Changes not reflecting

**Solution:**
1. Save the file
2. Wait 1-2 seconds
3. Make a new request
4. Check the server logs in Terminal 1

If still not working:
```bash
# Kill vercel dev (Ctrl+C)
# Restart it
vercel dev
```

### Issue: "Cannot GET /api/analyze-audio"

**Solution:** Make sure you're using POST, not GET:
```bash
# ✓ Correct
curl -X POST http://localhost:3000/api/analyze-audio ...

# ✗ Wrong
curl -X GET http://localhost:3000/api/analyze-audio ...
```

---

## Advanced: Run Frontend & API Separately

If you prefer to run them separately:

**Terminal 1: Run API only**
```bash
vercel dev --listen 4000
# API on http://localhost:4000/api/...
```

**Terminal 2: Run Frontend only**
```bash
cd frontend
bun run dev
# Frontend on http://localhost:5173
```

**Terminal 3: Test**
```bash
# Test frontend (connects to local API)
open http://localhost:5173

# But first, update frontend to call correct API:
# Change /api/analyze-audio to http://localhost:4000/api/analyze-audio
# in frontend/src/components/AudioRecorder.tsx
```

---

## Environment Variables in Local Dev

To use environment variables locally:

1. **Create `.env.local`** in root:
```env
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=yyy
```

2. **Access in API**:
```typescript
const spotifyId = process.env.SPOTIFY_CLIENT_ID;
```

3. **Restart vercel dev** to load new variables:
```bash
# Ctrl+C to stop
# vercel dev to start
```

---

## Full Development Stack (Recommended)

```bash
# Terminal 1: Start Vercel local dev
$ cd /Users/yeahboi/DEV/shaz
$ vercel dev
Listening on http://localhost:3000

# Terminal 2: Watch & test the API
$ ./api/test-api.sh http://localhost:3000/api/analyze-audio
# or
$ watch -n 2 './api/test-api.sh http://localhost:3000/api/analyze-audio'

# Terminal 3: View frontend
$ open http://localhost:3000

# Terminal 4: Develop
$ cd api
$ vim analyze-audio.ts
# Make changes, save, and test in Terminal 2
```

---

## Comparison: Local vs Production

| Feature | Local (`vercel dev`) | Production (Vercel) |
|---------|---------------------|-------------------|
| Environment | Node.js emulator | Vercel Node.js runtime |
| File system | `/tmp` access | `/tmp` access |
| Environment vars | `.env.local` | Vercel dashboard |
| Auto-reload | ✅ Yes | ✅ On push to GitHub |
| Speed | ~50ms | ~50-100ms |
| Cost | Free | Free tier available |
| Deploy needed | ❌ No | ✅ Push to GitHub |

---

## Quick Reference

```bash
# Start local development
vercel dev

# Test the API
./api/test-api.sh http://localhost:3000/api/analyze-audio

# View frontend
open http://localhost:3000

# Run specific test
curl -X POST http://localhost:3000/api/analyze-audio \
  -F "file=@/tmp/test.wav" | jq

# Debug with logs
# (All console.log() output appears in Terminal 1)

# Stop server
# Ctrl+C in Terminal 1

# Use custom port
vercel dev --listen 4000

# View Vercel config
cat vercel.json
```

---

## Summary

✅ **Yes, you can use serverless functions for local dev!**

- `vercel dev` runs your API and frontend locally
- Changes auto-reload without rebuilding
- Same environment as production
- Perfect for development and testing
- No deployment needed during development

**Start now:**
```bash
vercel dev
# That's it! Both API and frontend are ready at http://localhost:3000
```
