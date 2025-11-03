# API Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR BROWSER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Frontend React App (Vite)                              │  │
│  │   https://shaz-zeta.vercel.app                           │  │
│  │                                                          │  │
│  │   ┌──────────────────────────────────────────────────┐  │  │
│  │   │  AudioRecorder Component                        │  │  │
│  │   │  • Record audio from microphone                 │  │  │
│  │   │  • Convert to Blob (WebM format)               │  │  │
│  │   │  • Create FormData with audio file             │  │  │
│  │   └──────────────────────────────────────────────────┘  │  │
│  │                        ↓                                  │  │
│  │   ┌──────────────────────────────────────────────────┐  │  │
│  │   │  Fetch Request Handler                         │  │  │
│  │   │  fetch('/api/analyze-audio', {                 │  │  │
│  │   │    method: 'POST',                             │  │  │
│  │   │    body: formData  // audio file               │  │  │
│  │   │  })                                            │  │  │
│  │   └──────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                    HTTP POST Request
                    Content-Type: multipart/form-data
                    Body: { file: audioBlob }
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                     VERCEL PLATFORM                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Vercel Infrastructure                                  │  │
│  │  • Global CDN for static files (frontend)              │  │
│  │  • Serverless Function Execution Environment           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/analyze-audio.ts (Node.js Runtime)               │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  1. Receive POST Request                         │  │  │
│  │  │     • Extract multipart/form-data               │  │  │
│  │  │     • Validate file field exists                │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                        ↓                                │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  2. Parse Form Data (formidable)                │  │  │
│  │  │     • Read file from /tmp                       │  │  │
│  │  │     • Buffer audio data                         │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                        ↓                                │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  3. Analyze Audio                               │  │  │
│  │  │                                                  │  │  │
│  │  │  Current:                                       │  │  │
│  │  │  • generateMockDiscoveryResult(buffer)         │  │  │
│  │  │  • Returns random track from 10 songs          │  │  │
│  │  │                                                  │  │  │
│  │  │  Future:                                        │  │  │
│  │  │  • Call Spotify API                            │  │  │
│  │  │  • Call AcoustID fingerprinting               │  │  │
│  │  │  • Call Last.fm metadata API                  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                        ↓                                │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  4. Build Response                              │  │  │
│  │  │     {                                            │  │  │
│  │  │       track: {                                  │  │  │
│  │  │         title: "Song Name",                     │  │  │
│  │  │         subtitle: "Artist Name",                │  │  │
│  │  │         images: { coverart: "url" },           │  │  │
│  │  │         hub: { actions: [...] },               │  │  │
│  │  │         ...                                     │  │  │
│  │  │       },                                        │  │  │
│  │  │       artistInfo: { ... }                       │  │  │
│  │  │     }                                            │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                        ↓                                │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  5. Return Response (HTTP 200)                   │  │  │
│  │  │     Content-Type: application/json              │  │  │
│  │  │     Body: JSON discovery result                 │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                        ↓                                │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  6. Cleanup                                      │  │  │
│  │  │     • Delete /tmp file                          │  │  │
│  │  │     • Log execution                             │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                   HTTP Response (JSON)
                      HTTP 200 / 400 / 500
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR BROWSER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Frontend React App                                    │  │
│  │   • Receive JSON response                              │  │
│  │   • Parse track/artist info                            │  │
│  │   • Update UI with results                             │  │
│  │   • Display song, artist, album art, links             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence

```
┌──────────┐                                    ┌─────────┐
│ Frontend │                                    │ Vercel  │
│  React   │                                    │   API   │
└──────────┘                                    └─────────┘
     │                                               │
     │  1. User clicks record button                │
     ├─────────────────────────────────────────────►│
     │     (show recording UI)                      │
     │                                              │
     │  2. User stops recording                     │
     │     (audio blob created)                     │
     │                                              │
     │  3. POST /api/analyze-audio                  │
     │     (multipart/form-data + file)             │
     ├────────────────────────────────────────────► │
     │                                              │
     │                              4. Parse request│
     │                              5. Read file    │
     │                              6. Analyze     │
     │                                             │
     │                              7. Build JSON  │
     │                                             │
     │  8. JSON Response (HTTP 200)                │
     │ ◄────────────────────────────────────────────┤
     │                                              │
     │  9. Update UI with results                   │
     │     • Display track name                     │
     │     • Show album art                         │
     │     • Add artist info                        │
     │     • Show social links                      │
     │                                              │
     ▼                                              ▼
```

---

## File Structure & Request Flow

```
Request Path: POST /api/analyze-audio
    ↓
Vercel routes to: /api/analyze-audio.ts
    ↓
Function Handler Execution:
    ↓
┌──────────────────────────────────────┐
│ export default handler(req, res) {   │
│   // 1. Parse multipart form        │
│   const form = formidable()          │
│   const [fields, files] = ...        │
│                                      │
│   // 2. Get the file                │
│   const file = files.file[0]        │
│                                      │
│   // 3. Read buffer                 │
│   const buffer = fs.readFileSync() │
│                                      │
│   // 4. Analyze                     │
│   const result =                    │
│     generateMockDiscoveryResult()   │
│                                      │
│   // 5. Return JSON                 │
│   res.status(200).json(result)     │
│ }                                    │
└──────────────────────────────────────┘
    ↓
HTTP 200 + JSON Response
    ↓
Frontend receives JSON
    ↓
React component updates UI
```

---

## Deployment Architecture

```
Local Development:
  npm install -g vercel
  vercel dev
  ↓
  Runs locally at http://localhost:3000
  Frontend: React dev server
  API: Node.js serverless function emulator

Production Deployment:
  git push origin main
  ↓
  GitHub webhook triggers Vercel build
  ↓
  Vercel Build Process:
    1. Install dependencies: bun install
    2. Build frontend: bun run build
    3. Prepare API functions
  ↓
  Vercel Deployment:
    Frontend: Deployed to CDN (Global)
    API: Deployed to serverless function (Regional)
  ↓
  Live at: https://shaz-zeta.vercel.app
  - Frontend: CDN
  - API: /api/analyze-audio (Serverless)
```

---

## Error Handling Flow

```
User submits audio file
         ↓
    API receives request
         ↓
    Validation checks:
    ├─ Is method POST?  → No → HTTP 405 (Method not allowed)
    ├─ Is file present? → No → HTTP 400 (Bad request)
    └─ Is file readable? → No → HTTP 500 (Server error)
         ↓ (All checks pass)
    Process file
         ↓
    Any error during processing?
    ├─ Yes → HTTP 500 + error details
    └─ No  → HTTP 200 + JSON result
         ↓
    Clean up temp file
         ↓
    Return response
```

---

## Technologies Used

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Web Audio API** - Audio recording
- **Fetch API** - API calls

### API (Serverless)
- **Node.js 18+** - Runtime
- **TypeScript** - Type safety
- **Formidable** - Multipart form parsing
- **Vercel** - Deployment platform

### Infrastructure
- **Vercel** - Hosting & CDN
- **GitHub** - Version control
- **Git** - Auto-deployment trigger

---

## Response Format

```
Backend Response Structure:

{
  "track": {
    "title": string,           // Song name
    "subtitle": string,        // Artist name
    "images": {
      "coverart": string       // Album artwork URL
    },
    "hub": {
      "actions": [
        {
          "type": string,      // "spotify", etc.
          "uri": string        // External link
        }
      ]
    },
    "sections": [
      {
        "type": string,        // "BASIC_INFORMATION", etc.
        "metadata": [
          {
            "title": string,   // Label, Album, etc.
            "text": string     // Value
          }
        ]
      }
    ],
    "artists": [
      {
        "adamid": string       // Artist ID
      }
    ]
  },
  "artistInfo": {
    "type": string,           // "Artist"
    "country": string,        // Country code
    "socialLinks": {
      "twitter": string,
      "instagram": string,
      "facebook": string,
      "youtube": string,
      "tiktok": string,
      "soundcloud": string,
      "bandcamp": string,
      "website": string
    }
  }
}
```

---

## Scalability & Future Enhancements

```
Current (Mock):
  Audio File → Analyze → Return mock data
  Response time: ~50ms
  Cost: Free (Vercel free tier)

With Spotify Integration:
  Audio File → Extract features → Search Spotify API
           → Fetch track info → Return results
  Response time: ~500-1000ms
  Cost: Based on Spotify API calls

With AcoustID Fingerprinting:
  Audio File → Generate fingerprint → Query AcoustID
           → MusicBrainz lookup → Return metadata
  Response time: ~1000-2000ms
  Cost: Free (AcoustID free tier)

Optimization Options:
  • Cache frequently matched songs
  • Pre-process audio before upload
  • Use edge middleware for pre-filtering
  • Implement batch processing for multiple files
```

---

## Summary

The API is built as a **serverless function** that:
1. Receives audio file uploads from the frontend
2. Parses multipart form data
3. Processes the audio (currently mock, can be real)
4. Returns formatted JSON with track information
5. Cleans up temporary files
6. Auto-scales with Vercel

**Everything is production-ready and can be deployed with a simple `git push`!**
