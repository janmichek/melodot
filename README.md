# Melodot

Melodot is a decentralized music discovery and donation platform. 
Record live audio, identify tracks in real time, and tip artists directly on Polkadot’s Paseo Asset Hub.

## Table of Contents

- [Objectives](#objectives)
- [Core stack](#core-stack)
- [Setup](#setup)
- [Development Workflow](#development-workflow)
- [Smart Contracts](#smart-contracts)
- [Deployment](#deployment)

## Objectives

**For Users:**
- Make the process of expressing gratitude in the speed of sound
- Identify songs instantly via audio recognition
- Tip artists directly and instantly when music moves you


**For Artists:**
- Platform royalties are slow and heavily stripped by platform feed
- Receive direct payments with transparent on-chain records
- Get immediate appreciation from listeners without intermediaries


## Core stack 
- Based on Kitdot toolkit https://kitdot.dev/
- Contracts: Solidity 0.8.19, Hardhat, @parity/hardhat-polkadot
- Frontend: React 18, TypeScript, Vite, Wagmi, Viem, TailwindCSS 4, Shadcdn, Lucide Icons
- Auth: Web3Auth Modal
- API: Vercel serverless functions (Node.js/Bun compatible)
- Testing: Playwright (e2e), Hardhat (contracts)
- Package Manager: Bun

## Setup

### Prerequisites

- Node.js 20+
- Bun 1.1+
- Vercel CLI

### Installation

```bash
git clone https://github.com/janmichek/melodot.git
cd melodot
bun install
```

### Environment Variables

#### Frontend (.env)

No extra step needed. It's using public free API connections, so they are exposed right away.

#### Smart Contracts (contracts/.env)

Contract is already deployed, but if you want your own deployment, paste your private key.


## Development Workflow

```bash
# Frontend dev server (http://localhost:5173)
bun vercel dev

# Testing
bun run test:e2e          # End-to-end tests (Playwright)
bun run test:api          # API tests
bun run test:contract     # Contract tests
bun run test:all          # Run all tests

# Contracts
bun run deploy-contract  # Deploy to Paseo + generate types

```

## Smart Contracts

- Location: `contracts/contracts/Donate.sol`
- Network: Paseo Asset Hub testnet
  - Chain ID: `420420422` (0x1911f0a6)
  - RPC: `https://testnet-passet-hub-eth-rpc.polkadot.io`
  - Explorer: `https://blockscout-passet-hub.parity-testnet.parity.io`
  - Currency: PAS


## Deployment

- dapp is deployed on https://melodot.vercel.app/
- **Frontend + API**: Integrate github repo to Vercel integrattion. Push to main branch will trugger deployment

