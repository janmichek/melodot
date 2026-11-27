# Donalyze

Hear a song. Identify it. Tip the artist directly on Polkadot Hub TestNet.

Donalyze records a short audio sample, resolves the track and its Spotify artists, and sends PAS
tips through the `Donate` contract. Artists verify their Spotify bio once, receive an EIP-712 claim
authorisation, and withdraw directly.

## Stack

- Frontend: React 19, TypeScript, Vite 8, Wagmi, Viem, Tailwind CSS 4
- Auth: Web3Auth Modal
- API: Vercel serverless functions (Bun-compatible)
- Contracts: Solidity 0.8.24, Foundry, OpenZeppelin
- Tests: Vitest, Playwright, Foundry (unit, fuzz, invariant)
- Tooling: Bun, ESLint, Slither, Lighthouse CI, GitHub Actions

## Architecture

Feature-Sliced Design with downward imports:

```text
app -> pages -> widgets -> features -> entities -> shared
```

```text
src/
├── app/          providers, router, shell, global styles
├── pages/        discover, claim, donations, statistics, about, owner
├── widgets/      app shell, donation tables, statistics ledger
├── features/     discover, donate, claim, owner-withdraw
├── entities/     artist, donation, contract reads
└── shared/       UI kit, config, formatting, SEO, RPC helpers
```

Slices expose an `index.ts`. Tests live next to the code as `*.test.ts(x)`; browser specs live in
`tests/`. The decision record is `docs/adr/0001-feature-sliced-design.md`.

## Setup

Prerequisites: Node 22+, Bun 1.4+, Foundry, and (for contract work) a funded testnet signer.

```sh
bun install
cp .env.example .env
cd contracts && bun run install:libs && cd ..
bun run dev
```

The app runs at http://localhost:5173. Foundry tests need `contracts/lib` installed once.

### Environment

Root `.env`:

```sh
VITE_WEB3AUTH_CLIENT_ID=
RAPIDAPI_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
VITE_VERIFICATION_CODE=

VITE_CONTRACT_ADDRESS=
CLAIM_SIGNER_PRIVATE_KEY=
CLAIM_CONTRACT_ADDRESS=
```

`CLAIM_SIGNER_PRIVATE_KEY` must correspond to the on-chain `CLAIM_SIGNER`; `CLAIM_CONTRACT_ADDRESS`
must be the deployed `Donate` address. Without `VITE_CONTRACT_ADDRESS` the app reads
`contracts/deployments/polkadotHubTestnet.json` and shows a configuration banner instead of
allowing donations.

Contract `.env` (`contracts/.env`):

```sh
OWNER=0x...
CLAIM_SIGNER=0x...
# Prefer `cast wallet import` + `--account` over a raw key.
PRIVATE_KEY=
```

## Commands

```sh
bun run dev                 # Vite dev server
bun run build               # tsc + production build
bun run typecheck
bun run lint
bun run test:unit           # Vitest
bun run test:coverage       # Vitest + coverage floors
bun run test:e2e            # Playwright (starts Vite)
bun run test:contract       # Foundry
bun run test:contract:coverage
bun run test:all
bun run slither             # static analysis
bun run validate            # static gate + unit + contract
bun run audit               # production dependency audit
bun run contract:deploy     # deploy, sync address, generate types
bun run contract:sync
bun run generate
```

For an e2e recording at 85% CPU:

```sh
PLAYWRIGHT_CPU_THROTTLE=85 bun run test:e2e
```

There is no Cypress suite; Playwright is the browser runner.

## Contracts

- Source: `contracts/src/Donate.sol`
- Tests: unit, fuzz, and invariant campaigns in `contracts/test`
- Network: Polkadot Hub TestNet, chain `420420417`, currency PAS
- RPC: `https://eth-rpc-testnet.polkadot.io/`
- Explorer: https://blockscout-testnet.polkadot.io

Donation flow:

1. `donateToArtist` credits the artist balance and accrues the 1% platform fee.
2. `/api/verify` checks the Spotify bio and signs an EIP-712 `Claim(artistId, claimant, deadline)`.
3. `claimArtist` binds the artist ID to the claimant.
4. `settleDonations` moves the balance to `pendingWithdrawals`.
5. `withdraw` pays PAS to the chosen recipient.

Slither runs with `contracts/slither.config.json` and must stay clean for first-party code. Foundry
coverage is enforced at 100% in CI.

## Deployment

```sh
bun run contract:deploy
```

The deploy script reads `OWNER` and `CLAIM_SIGNER`, broadcasts with the configured Foundry signer,
copies the address into `contracts/deployments/polkadotHubTestnet.json`, and regenerates
`src/shared/config/generated.ts`. Set `VITE_CONTRACT_ADDRESS` and `CLAIM_CONTRACT_ADDRESS` in Vercel
(Production and Preview) as well.

## SEO and agent discovery

- `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/humans.txt`
- `/.well-known/security.txt`, `/.well-known/agent.json`
- Open Graph, Twitter cards, canonical URLs, and `WebApplication` + `FAQPage` JSON-LD in `index.html`
- Per-route title/description/canonical via `usePageMeta`

## Security notes

- Never commit `.env`; the repository history contains legacy credentials that must be rotated.
- The previously deployed contract at `0x031002Cc82cce5172BdbC8c9Ca4E1731f17BbEC1` is deprecated.
  Do not point the app at it.
- Claims are authorisation-gated in the new contract. Do not deploy with the zero address.
- Run `bun run slither`, `bun run test:contract:coverage`, and the e2e suite before merging.
