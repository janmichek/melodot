# Donalyze Development Guide

> **Finish line.** Before calling a task complete, run `bun run validate`, `bun run test:contract:coverage`, `bun run slither`, and `bun run build`. UI changes also run `bun run test:e2e`. Never lower `config/coverage-floors.json` or skip a red gate; add the missing test instead. Architecture follows `docs/adr/0001-feature-sliced-design.md`: `app → pages → widgets → features → entities → shared`.

_Comprehensive instructions for AI agents helping develop Donalyze_

## Project Overview

**Donalyze** is a decentralized music discovery and tipping platform that:
- Records audio using Web Audio API
- Identifies songs through audio recognition
- Enables direct artist tipping via smart contracts on Polkadot
- Allows artists to claim their identity and withdraw donations
- Integrates Web3Auth for seamless user onboarding

## Tech Stack

### Core Technologies
- **Smart Contracts**: Solidity 0.8.24, Foundry (Forge), Polkadot Hub TestNet
- **Frontend**: React 19, TypeScript, Vite
- **Web3**: Wagmi, Viem, Web3Auth Modal
- **Styling**: TailwindCSS 4, Radix UI, Lucide icons
- **Audio**: Web Audio API
- **API**: Vercel serverless functions
- **Package Manager**: Bun
- **Testing**: Foundry (contracts), Playwright (e2e)

### Key Dependencies
```json
{
  "wagmi": "Web3 React hooks",
  "viem": "TypeScript Web3 client",
  "@web3auth/modal": "Social login for Web3",
  "@tanstack/react-query": "Data fetching",
  "lucide-react": "Icon library",
  "@radix-ui": "Headless UI components"
}
```

## Project Structure

```
shaz/
├── contracts/              # Smart contracts (Foundry)
│   ├── src/
│   │   └── Donate.sol     # Artist donation contract
│   ├── test/              # Forge tests (unit, fuzz, invariant)
│   │   ├── Donate.t.sol
│   │   ├── Donate.fuzz.t.sol
│   │   ├── Donate.invariant.t.sol
│   │   ├── handlers/     # Invariant test handler
│   │   └── mocks/        # Reentrancy / receive mocks
│   ├── script/
│   │   └── Deploy.s.sol   # Deployment script
│   ├── deployments/
│   │   └── polkadotHubTestnet.json  # Deployed address (read by wagmi)
│   ├── foundry.toml       # Foundry configuration
│   └── remappings.txt     # forge-std / OpenZeppelin remappings
├── scripts/
│   └── sync-deployment.ts # Copies broadcast address into deployments JSON
├── api/                   # Vercel serverless functions
│   ├── endpoints/
│   │   ├── discover.ts   # Music discovery endpoint
│   │   ├── artist.ts      # Single artist info
│   │   ├── artists.ts     # Multiple artists info
│   │   ├── track.ts       # Track information
│   │   └── verify.ts      # Artist verification
│   ├── api.ts             # Centralized API utilities
│   ├── mock-discovery-data.ts
│   └── utils.ts           # API utilities
├── src/                   # React application
│   ├── components/        # React components
│   │   ├── DiscoveryButton.tsx
│   │   ├── DiscoveryRecorder.tsx
│   │   ├── DiscoveryCard.tsx
│   │   ├── DonationForm.tsx
│   │   ├── OwnerWithdrawForm.tsx
│   │   ├── ArtistPayoutForm.tsx
│   │   ├── ClaimCard.tsx
│   │   ├── ClaimFlow.tsx
│   │   ├── UserMenu.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── Header.tsx
│   │   ├── StatisticsDashboard.tsx
│   │   └── ui/            # Radix UI components
│   ├── pages/            # Page components
│   │   ├── Discover.tsx   # Main discovery page
│   │   ├── Claim.tsx      # Artist claim page
│   │   ├── Donations.tsx  # Donations history
│   │   └── Owner.tsx      # Owner dashboard
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities
│   ├── generated.ts      # Auto-generated Wagmi types
│   └── wagmi-config.ts   # Wagmi configuration
├── tests/                # Playwright e2e tests
├── dist/                 # Production build
└── package.json
```

## Network Configuration

### Polkadot Hub TestNet (successor of the retired Passet Hub)

**Network Details:**
- Chain ID: `420420417` (0x190f1b41)
- RPC: `https://eth-rpc-testnet.polkadot.io/` (fallback: `https://services.polkadothub-rpc.com/testnet`)
- Explorer: `https://blockscout-testnet.polkadot.io`
- Faucet: `https://faucet.polkadot.io/?parachain=1111`
- Currency: PAS

**Foundry Configuration** (`contracts/foundry.toml`):
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
test = "test"
script = "script"
solc = "0.8.24"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
polkadotHubTestnet = "https://eth-rpc-testnet.polkadot.io"
```

Deploy with the named endpoint:
```bash
cd contracts
forge script script/Deploy.s.sol:Deploy --rpc-url polkadotHubTestnet --broadcast
```

## Development Workflow

### Essential Commands

```bash
# Development
bun install                  # Install dependencies
bun dev                      # Start dev server (port 5173)
bun run build                # Build for production
bun run reinstall            # Clean reinstall

# Contracts (from repo root)
bun run test:contract        # forge test -vvv
bun run test:contract:ci     # forge test --profile ci
bun run test:contract:coverage
bun run contract:deploy      # Deploy, sync address, generate types
bun run contract:sync        # Record broadcast address in contracts/deployments
bun run contract:redeploy    # forge clean + deploy
bun run contract:clean       # forge clean

# Inside contracts/
bun run build                # forge build --sizes
bun run test                 # forge test
bun run test:gas             # forge test --gas-report
bun run fmt                  # forge fmt
bun run lint                 # forge lint
bun run install:libs         # Install forge-std + OpenZeppelin

# Testing
bun run test:e2e             # Run e2e tests (Playwright)
bun run test:api             # Test API functions
bun run test:all             # Run all tests

# Code Generation
bun run generate             # forge build + wagmi generate
```

`bun run generate` reads the ABI from `contracts/out/Donate.sol/Donate.json` and the
address from `contracts/deployments/polkadotHubTestnet.json`. It fails when the address
is still the zero placeholder.

### Private Key Setup

**IMPORTANT**: Never commit private keys.

```bash
# contracts/.env
OWNER=0x...          # Contract owner and platform fee recipient
CLAIM_SIGNER=0x...   # Signs EIP-712 claim authorisations
PRIVATE_KEY=0x...    # Optional signer for `forge script --broadcast`
```

Prefer a Foundry keystore over a raw key:
```bash
cast wallet import donalyze --interactive
cd contracts
forge script script/Deploy.s.sol:Deploy --rpc-url polkadotHubTestnet --broadcast --account donalyze
```

### Get Testnet Tokens
1. Visit [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111)
2. Enter your wallet address
3. Receive PAS tokens for testing

## Smart Contract Architecture

### Donate.sol

**Contract Features:**
- Artist donation tracking by ID (Spotify artist ID)
- Platform fee: 1% default (100 basis points, configurable up to 10_000)
- EIP-712 signed artist claims with a deadline
- Pull-payment withdrawals for artists, platform fees, and the owner

**Key Functions:**
```solidity
// Donate to artist
donateToArtist(string calldata artistId) external payable

// Artist claims identity with a platform-signed EIP-712 authorisation
claimArtist(string calldata artistId, uint256 deadline, bytes calldata signature) external

// Claimant moves the artist balance into pending withdrawals
settleDonations(string calldata artistId) external

// Owner moves accrued platform fees into pending withdrawals
settlePlatformFees() external onlyOwner

// Pull payment
withdraw(address recipient) external nonReentrant

// Owner-only administration
setPlatformFeeInfo(address recipient, uint256 feeBps) external onlyOwner
setClaimSigner(address claimSigner) external onlyOwner

// View functions
getArtistInfo(string calldata artistId) external view
getArtistClaimant(string calldata artistId) external view
getArtistsCount() external view
getPlatformFeeBalance() external view
getPlatformFeeInfo() external view
claimSigner() external view
getClaimDigest(string calldata artistId, address claimant, uint256 deadline) external view
```

**Donation Flow:**
1. `donateToArtist` credits the artist balance and accrues the platform fee.
2. Off-chain verification issues an EIP-712 signature from `CLAIM_SIGNER`.
3. `claimArtist` binds the artist ID to the caller.
4. `settleDonations` moves the artist balance into `pendingWithdrawals`.
5. `withdraw` pays out the pending balance.

**Security Patterns:**
- Custom errors for gas efficiency
- OpenZeppelin `Ownable2Step`, `ReentrancyGuard`, `ECDSA`, `EIP712`
- Checks-effects-interactions
- Direct ETH transfers rejected; payouts use pull payments

### Contract Limitations

- **EVM size limit**: 24 KB deployed bytecode (`forge build --sizes`)
- **Non-upgradeable**: redeploy to change logic
- **Off-chain verification**: Spotify bio checks do not happen on-chain

## Frontend Architecture

### Web3 Integration

**Wagmi Configuration:**
```typescript
// Auto-generated from contract deployment
import { donateConfig } from "./generated";
import { useWriteContract } from "wagmi";

// Donate to artist
const { writeContract } = useWriteContract();
writeContract({
  ...donateConfig,
  functionName: "donateToArtist",
  args: [artistId],
  value: parseEther(amount),
});
```

### Web3Auth Setup

**Required Environment Variable:**
```bash
VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
```

Get your client ID from [Web3Auth Dashboard](https://dashboard.web3auth.io/)

**Configuration Structure:**
- `src/web3authContext.tsx`: Minimal config with client ID and network only
- `src/wagmi-config.ts`: Chain definitions (single source of truth)
- `src/main.tsx`: Providers setup (Web3AuthProvider wraps WagmiProvider)

### Audio Recording Flow

1. Request microphone permission
2. Record audio using Web Audio API
3. Send audio blob to `/api/discover`
4. Display song metadata and artist info
5. Enable donation to identified artist

**Key Components:**
- `DiscoveryButton.tsx` / `DiscoveryRecorder.tsx`: Audio recording interface
- `DiscoveryCard.tsx`: Display identified song with donation options
- `DonationForm.tsx`: Multi-artist donation form with amount controls
- `OwnerWithdrawForm.tsx`: Platform fee withdrawal (owner only)
- `ArtistPayoutForm.tsx`: Artist donation withdrawal
- `ClaimCard.tsx` / `ClaimFlow.tsx`: Artist identity claiming
- `UserMenu.tsx`: Wallet connection and user info
- `AppSidebar.tsx`: Navigation sidebar
- `Header.tsx`: App header with theme toggle
- `StatisticsDashboard.tsx`: Platform statistics display
- `DonationsArtistsTable.tsx`: Donations by artist view
- `DonationsDonorsTable.tsx`: Donations by donor view
- `DonationsTransactionsTable.tsx`: Transaction history

**Pages:**
- `Discover.tsx`: Main discovery and donation page
- `Claim.tsx`: Artist identity claiming page
- `Donations.tsx`: Donations history and analytics
- `Owner.tsx`: Owner dashboard for platform management

## API Endpoints

All API endpoints are Vercel serverless functions located in `api/endpoints/`.

### POST /api/discover

**Purpose**: Discover audio and identify music

**Request:**
```typescript
const formData = new FormData();
formData.append('file', audioBlob, 'recording.webm');

const response = await fetch('/api/discover', {
  method: 'POST',
  body: formData,
});
```

**Response:**
```typescript
{
  track: {
    title: string;
    subtitle: string; // Artist name
    images: { coverart: string };
    hub: { 
      providers: [{ type: "SPOTIFY", actions: [{ uri: string }] }]
    };
    artists: [{ adamid: string }]; // Spotify artist ID
  },
  artistInfo: {
    type: "Artist";
    country: string;
    socialLinks: {
      twitter?: string;
      instagram?: string;
      spotify?: string;
      facebook?: string;
      youtube?: string;
      tiktok?: string;
      soundcloud?: string;
      bandcamp?: string;
      website?: string;
    }
  }
}
```

**Current Implementation**: Uses mock data when `USE_MOCK_DATA=true`, otherwise integrates with Shazam API via RapidAPI and Spotify API.

### GET /api/artist

**Purpose**: Fetch single artist information from Spotify

**Request:**
```typescript
const response = await fetch('/api/artist?artistUrl=ARTIST_ID_OR_URL');
```

**Response:**
```typescript
{
  artist: SpotifyArtistResponse; // Full Spotify artist object
}
```

**Requires**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`

### GET /api/artists

**Purpose**: Fetch multiple artists information (up to 50)

**Request:**
```typescript
const response = await fetch('/api/artists?ids=id1,id2,id3');
```

**Response:**
```typescript
{
  artists: ArtistsMap; // Map of artist ID to SpotifyArtistResponse
}
```

**Requires**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`

### GET /api/track

**Purpose**: Fetch track information from Spotify

**Request:**
```typescript
const response = await fetch('/api/track?uri=spotify:track:TRACK_ID');
```

**Response:**
```typescript
{
  track: SpotifyTrackResponse; // Full Spotify track object
}
```

**Requires**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`

### GET /api/verify

**Purpose**: Verify artist identity by checking biography for verification code

**Request:**
```typescript
const response = await fetch('/api/verify?artistId=ARTIST_ID');
```

**Response:**
```typescript
{
  verified: boolean;
}
```

**Requires**: `RAPIDAPI_KEY`, `VITE_VERIFICATION_CODE`

## Environment Variables

### Required

```bash
# .env (root)
VITE_WEB3AUTH_CLIENT_ID=       # Web3Auth dashboard

# contracts/.env (deployment)
OWNER=                          # Contract owner + platform fee recipient
CLAIM_SIGNER=                   # EIP-712 claim signer
PRIVATE_KEY=                    # Optional; prefer a Foundry keystore
```

### Optional (for music APIs)

```bash
VITE_RAPIDAPI_KEY=             # RapidAPI key for Shazam/Spotify scraper
SPOTIFY_CLIENT_ID=             # Spotify API client ID
SPOTIFY_CLIENT_SECRET=         # Spotify API client secret
VITE_VERIFICATION_CODE=        # Code artists must include in bio to verify
```

## Deployment

### Contract Deployment

```bash
bun run contract:deploy
```

This runs `forge script script/Deploy.s.sol:Deploy --rpc-url polkadotHubTestnet
--broadcast`, copies the address into `contracts/deployments/polkadotHubTestnet.json`,
and regenerates `src/generated.ts`.

**Deployment Checklist:**
- [ ] Foundry installed (`forge --version`)
- [ ] Foundry dependencies installed: `cd contracts && bun run install:libs`
- [ ] `OWNER` and `CLAIM_SIGNER` set in `contracts/.env`
- [ ] Funded signer available (`--account` keystore or `PRIVATE_KEY`)
- [ ] Sufficient PAS tokens in wallet
- [ ] `forge build --sizes` passes
- [ ] Deployment address recorded in `contracts/deployments/polkadotHubTestnet.json`

**Reset Deployment State:**
```bash
bun run contract:redeploy   # forge clean + deploy
```

**Manual deploy:**
```bash
cd contracts
forge script script/Deploy.s.sol:Deploy --rpc-url polkadotHubTestnet --broadcast --account donalyze
```

### Frontend Deployment (Vercel)

```bash
# Automatic deployment
git push origin main

# Or manual
vercel deploy --prod
```

**Vercel Configuration:**
- Build command: `bun run build`
- Output directory: `dist`
- Install command: `bun install`
- Framework preset: Vite
- Environment variables: Set in Vercel dashboard

## Testing

### E2E Tests (Playwright)
```bash
bun run test:e2e          # Run e2e tests
```

### Contract Tests (Foundry)
```bash
bun run test:contract          # forge test -vvv
bun run test:contract:ci       # fuzz 1024 / invariant 256 x 128
bun run test:contract:coverage # forge coverage
```

Test layout:
- `contracts/test/Donate.t.sol` — unit tests
- `contracts/test/Donate.fuzz.t.sol` — stateless fuzzing
- `contracts/test/Donate.invariant.t.sol` — invariant campaign
- `contracts/test/handlers/DonateHandler.sol` — bounded handler
- `contracts/test/mocks/` — reentrancy and revert-on-receive mocks

## Common Issues & Solutions

### Missing Foundry Dependencies
**Cause**: `contracts/lib` is ignored by git and not installed.
**Solution**: `cd contracts && bun run install:libs`

### "Donate address is not configured"
**Cause**: `contracts/deployments/polkadotHubTestnet.json` still holds the zero address.
**Solution**: Run `bun run contract:deploy`, or record the deployed address and run `bun run generate`.

### "Broadcast artifact not found"
**Cause**: `contract:sync` ran without a broadcast.
**Solution**: Deploy with `--broadcast` first, then `bun run contract:sync`.

### Contract Deployment Fails
**Checklist**:
- `OWNER` and `CLAIM_SIGNER` set in `contracts/.env`
- Funded signer passed via `--account` or `--private-key`
- Sufficient PAS balance
- RPC reachable: `cast chain-id --rpc-url polkadotHubTestnet`
- Clean state: `bun run contract:clean`

### Web3Auth Not Working
**Checklist**:
- `VITE_WEB3AUTH_CLIENT_ID` set correctly
- Network matches (Polkadot Hub TestNet, chain ID `420420417`)
- Browser has Web3 wallet extension

### Type Errors After Contract Changes
**Solution**:
```bash
bun run contract:deploy  # Redeploy + sync address + regenerate types
# or, with a recorded deployment address:
bun run generate
```

## Security Best Practices

### Environment Variables & Secrets
- **Never commit .env files** - Add to `.gitignore`
- **Rotate exposed credentials immediately** - If secrets are committed, they're compromised
- **Use separate keys for dev/prod** - Don't reuse production credentials
- **Prefix client-side vars with VITE_** - Only VITE_ vars are bundled into frontend

### Input Validation
- **Validate Spotify IDs**: Must be 22 alphanumeric characters (`/^[a-zA-Z0-9]{22}$/`)
- **Check HTTP responses**: Always verify `response.ok` before parsing JSON
- **Use type guards**: Validate contract return types with proper type guards, not unsafe casts

### Frontend Security
- **No demo bypasses in production** - Remove test buttons that skip verification
- **Verify artist identity** - Always require verification before claiming
- **Use type-safe patterns** - Create type guards for contract data instead of `as` casts

### API Security
- **Add CORS headers** - Restrict API access to your domain
- **Implement rate limiting** - Prevent API abuse and quota exhaustion
- **Validate all inputs** - Check format, length, and type of all parameters
- **Don't expose internal errors** - Log server-side, return generic messages to clients

### Smart Contract Security
- **Reuse audited primitives** - OpenZeppelin `Ownable2Step`, `ReentrancyGuard`, `ECDSA`, `EIP712`
- **Bind signatures to context** - EIP-712 claims include artist ID, claimant, and deadline
- **Follow checks-effects-interactions** - Update state before external calls
- **Use pull payments** - Credit `pendingWithdrawals`, let recipients withdraw
- **Validate string lengths** - Prevent storage bloat with maximum length checks

## Code Style & Conventions

### Writing Style (Documentation)

**Core Principles:**
- Use active voice: "Deploy the contract" not "The contract should be deployed"
- Lead with results: State what happens, then explain how
- Be brief: Cut qualifiers like "very", "quite", "rather"
- Use simple words: "use" not "utilize", "do" not "implement"
- Provide exact commands, not abstractions

**Technical Documentation:**
- Start with what it does, not how it works
- Use concrete examples over abstract descriptions
- Write instructions as commands
- Assume intelligence but not knowledge

### Contract Development

- **Solidity Version**: 0.8.24
- **Formatting**: `forge fmt` (120 char lines, 4-space tabs)
- **Gas Optimization**: Use custom errors instead of require strings
- **Security**: Follow checks-effects-interactions pattern
- **Naming**: Clear, descriptive function and variable names
- **Docs**: NatSpec on external functions and state variables

### Frontend Development

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Styling**: TailwindCSS utility classes
- **State**: React Query for server state, useState for local state

### Performance Patterns

- **Use useMemo** - Memoize expensive computations (sorting, filtering, mapping)
- **Use useCallback** - Memoize functions passed to child components
- **Memoize arrays** - Arrays passed to hooks should be memoized to prevent re-fetching
- **Avoid inline objects** - Objects/arrays created in render cause child re-renders
- **writeContract is synchronous** - Don't wrap in try-catch, use error state instead

## Troubleshooting Checklist

**Before asking for help:**

- [ ] Dependencies installed: `bun install`
- [ ] Foundry dependencies installed: `cd contracts && bun run install:libs`
- [ ] Environment variables set in `.env`
- [ ] `OWNER` and `CLAIM_SIGNER` set in `contracts/.env`
- [ ] Sufficient PAS testnet tokens
- [ ] Contract compiles: `cd contracts && forge build --sizes`
- [ ] Network RPC accessible: `cast chain-id --rpc-url polkadotHubTestnet`
- [ ] Web3Auth client ID configured
- [ ] Generated types up to date: `bun run generate`

## Quick Reference

### Key Files
- `contracts/src/Donate.sol` - Main donation contract
- `contracts/test/Donate.t.sol` - Contract unit tests
- `contracts/script/Deploy.s.sol` - Deployment script
- `contracts/foundry.toml` - Foundry config and RPC endpoints
- `contracts/deployments/polkadotHubTestnet.json` - Deployed address
- `scripts/sync-deployment.ts` - Copies broadcast address into deployments JSON
- `wagmi.config.ts` - Reads ABI + address and generates `src/generated.ts`
- `src/main.tsx` - App entry point and providers setup
- `src/wagmi-config.ts` - Chain definitions (single source of truth)
- `src/web3authContext.tsx` - Web3Auth client configuration
- `src/components/DiscoveryButton.tsx` - Recording interface
- `src/components/DiscoveryCard.tsx` - Song display and donation
- `src/components/DonationForm.tsx` - Multi-artist donation form
- `src/pages/Discover.tsx` - Main discovery page
- `src/pages/Claim.tsx` - Artist claim page
- `src/pages/Donations.tsx` - Donations history
- `src/pages/Owner.tsx` - Owner dashboard
- `api/endpoints/discover.ts` - Music discovery API
- `api/api.ts` - Centralized API utilities
- `src/generated.ts` - Auto-generated Wagmi contract types
- `package.json` - Scripts and dependencies

### Key URLs
- Local dev: `http://localhost:5173`
- Block explorer: `https://blockscout-testnet.polkadot.io`
- Faucet: `https://faucet.polkadot.io/?parachain=1111`
- Web3Auth dashboard: `https://dashboard.web3auth.io`

### Package Manager: Bun
This project uses Bun, not npm or yarn. Always use:
- `bun install` (not npm install)
- `bun run <script>` (not npm run)
- `bun add <package>` (not npm install)

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/)
- [Polkadot Smart Contracts](https://docs.polkadot.com/develop/smart-contracts/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Web3Auth Documentation](https://web3auth.io/docs)
- [Viem Documentation](https://viem.sh/)
- [Shazam API (RapidAPI)](https://rapidapi.com/apidojo/api/shazam)

---

**Remember**: This is a Polkadot-based project using EVM compatibility. Build with Foundry, deploy with `bun run contract:deploy`, and use PAS testnet tokens.
