# BeatChain

BeatChain is a decentralized music discovery and tipping platform. Record live audio, identify tracks in real time, and tip artists directly on Polkadot’s Paseo Asset Hub.

## Highlights

- Audio capture and music recognition with the Web Audio API
- Direct artist tipping backed by Solidity smart contracts
- Social login via Web3Auth for fast onboarding
- Transparent, on-chain payouts with a 1% platform fee

## Table of Contents

- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Smart Contracts](#smart-contracts)
- [Frontend](#frontend)
- [API](#api)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## Architecture

```
shaz/
├── api/                  # Vercel serverless functions (Bun)
├── contracts/            # Hardhat workspace for Donate.sol
├── src/                  # React app (Vite + TypeScript)
├── tests/                # Playwright journeys
├── playwright-report/    # Last Playwright run output
├── dist/                 # Production build output
└── package.json
```

**Core stack**
- Contracts: Solidity 0.8.19, Hardhat, @parity/hardhat-polkadot
- Frontend: React 18, TypeScript, Vite, Wagmi, Viem, TailwindCSS 4
- Auth: Web3Auth Modal
- Storage & tooling: Bun, Playwright, Vercel functions

## Getting Started

### Prerequisites

- Node.js 20+
- Bun 1.1+
- MetaMask (or any EVM wallet supporting custom RPCs)
- PAS testnet funds from the [Polkadot faucet](https://faucet.polkadot.io/?parachain=1111)

### Installation

```bash
git clone https://github.com/<org>/beatchain.git
cd beatchain
bun install
```

### Environment Variables

Create `.env` in the project root:

```bash
VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
PRIVATE_KEY=deployment_private_key_without_0x
```

Optional integrations (set only when needed):

```bash
VITE_RAPIDAPI_KEY=        # Shazam RapidAPI
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://localhost:5173/claim
ACOUSTID_API_KEY=
LASTFM_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
```

## Development Workflow

```bash
# Frontend dev server (http://localhost:5173)
bun run dev:vite

# Type-safe contract bindings
bun run generate

# End-to-end tests (Playwright)
bun run test:e2e

# Clean reinstall
bun run reinstall
```

## Smart Contracts

- Location: `contracts/contracts/Donate.sol`
- Network: Paseo Asset Hub testnet (`chainId 420420422`)
- Tooling: Hardhat with `@parity/hardhat-polkadot`
- Features:
  - Donation routing by Spotify artist ID
  - Artist claiming and withdrawals
  - Owner-controlled platform fee withdrawal
  - Reentrancy-safe checks-effects-interactions pattern

### Contract Commands

```bash
cd contracts
bun install                     # one-time setup
bun run compile                 # compile with solc 0.8.19
bun run test                    # hardhat tests
bun run deploy-contract         # deploy to Paseo + generate types
```

Set `PRIVATE_KEY` (no `0x` prefix) in `contracts/.env` before deploying. Ensure the wallet holds PAS on Paseo Asset Hub.

## Frontend

- Location: `src/`
- Key components:
  - `components/AudioControls.tsx` handles recording and upload
  - `components/DiscoveryCard.tsx` displays identified tracks
  - `components/OwnerWithdrawForm.tsx` manages fee withdrawals
  - `web3authContext.tsx` wires Web3Auth into the app
- Generated contract hooks live in `src/generated.ts` (output of `bun run generate`).

## API

Serverless functions live in `api/` and deploy automatically with Vercel.

### Overview

- Runtime: Vercel Edge-compatible Node (Bun tooling)
- Primary responsibility: accept recorded audio, return canonical track + artist metadata
- Current mode: deterministic mock data while integrations are evaluated

### POST `/api/analyze-audio`

**Request**
- Method: `POST`
- URL: `/api/analyze-audio`
- Headers: `Content-Type: multipart/form-data`
- Body: `file` field containing audio (≤50 MB)

```bash
curl -X POST http://localhost:5173/api/analyze-audio \
  -F "file=@path/to/audio.mp3"
```

**Response**

```json
{
  "track": {
    "title": "Song Title",
    "subtitle": "Artist Name",
    "images": { "coverart": "https://image-url.jpg" },
    "hub": {
      "actions": [
        { "type": "spotify", "uri": "https://open.spotify.com/track/..." }
      ]
    },
    "sections": [
      {
        "type": "BASIC_INFORMATION",
        "metadata": [{ "title": "Album", "text": "Album Name" }]
      }
    ],
    "artists": [{ "adamid": "artist-id" }]
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

### Local API Development

```bash
# Install Vercel CLI once
npm install -g vercel

# From repository root
vercel dev
```

The dev server proxies frontend + API at `http://localhost:5173`. Use the curl command above or the frontend recorder to test uploads.

### Extending Audio Recognition

Replace `generateMockDiscoveryResult()` in `api/analyze-audio.ts` with a real integration. Common choices:

- **Spotify Web API** – exchange client credentials, derive audio features, then search for the closest track.
- **AcoustID / MusicBrainz** – generate an acoustic fingerprint and look up metadata.
- **Last.fm** – match extracted metadata against the Last.fm catalog.
- **AWS Rekognition (custom)** – queue for heavier audio/image analysis workflows.

Store credentials in `.env.local` (local) or in the Vercel project settings.

### Deployment Notes

Automatic: push to the default branch and let Vercel handle build + deploy.  
Manual: `vercel deploy --prod`.

Verify deployments with:

```bash
curl -X POST https://<your-app>.vercel.app/api/analyze-audio \
  -F "file=@path/to/audio.mp3"
```

### Error Handling

- `200` success
- `400` missing audio file
- `405` unsupported method
- `500` unexpected runtime error (returns diagnostic message in development)

## Testing

```bash
bun run test:e2e      # Playwright scenarios
bun run test:api      # API smoke tests (inside /api)
bun run test:contract # Hardhat test suite
```

Playwright artifacts live in `playwright-report/` and `test-results/`.

## Deployment

- **Frontend + API**: Vercel (build command `bun run build`, output `dist/`)
- **Smart contracts**: `cd contracts && bun run deploy-contract`
- **Network**: Paseo Asset Hub (`https://testnet-passet-hub-eth-rpc.polkadot.io`)

Reset contract state if needed:

```bash
cd contracts
rm -rf ignition/deployments
bun run deploy-contract
```

## Troubleshooting

- **Web3Auth login fails**: confirm `VITE_WEB3AUTH_CLIENT_ID` and that the selected network matches Paseo Asset Hub.
- **Contract deployment rejected**: ensure `polkavm: true` in `contracts/hardhat.config.ts`, the private key lacks `0x`, and the account holds PAS.
- **Type errors after contract updates**: run `bun run generate`.
- **API returns 404/405**: confirm `api/analyze-audio.ts` exists and that requests use `POST` with `multipart/form-data`.
- **Uploads rejected**: check the form field name is `file` and payload size ≤50 MB.
- **Request timeouts**: reduce audio length or offload heavy analysis to a queued worker.

## Resources

- [Polkadot Smart Contracts](https://docs.polkadot.com/develop/smart-contracts/)
- [Hardhat × Polkadot Plugin](https://github.com/paritytech/hardhat-polkadot)
- [Wagmi](https://wagmi.sh/)
- [Web3Auth](https://web3auth.io/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Viem](https://viem.sh/)