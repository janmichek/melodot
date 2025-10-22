# Shaz

Decentralized music discovery and tipping platform on Polkadot. Identify songs through audio recognition and tip artists directly with crypto.

## Features

- Audio recording and music recognition
- Direct artist tipping via smart contracts
- Web3Auth integration for easy onboarding
- Transparent on-chain donations

## Tech Stack

- **Contracts**: Solidity, Hardhat, Polkadot Paseo Asset Hub
- **Frontend**: React, TypeScript, Vite, Wagmi, Web3Auth
- **Audio**: Web Audio API

## Quick Start

### Prerequisites

- Node.js 20+
- Bun or npm
- MetaMask wallet
- [PAS testnet tokens](https://faucet.polkadot.io/?parachain=1111)

### Setup

```bash
# Install dependencies
git clone <repository-url>
cd shaz
bun install

# Configure contracts
cd contracts
cp .env.example .env
# Add your PRIVATE_KEY to .env

# Configure frontend
cd ../frontend
# Add VITE_WEB3AUTH_CLIENT_ID to .env

# Run the app
cd ..
bun start
```

Visit `http://localhost:5173`

### Get Testnet Tokens

1. Add [Paseo Asset Hub via Chainlist](https://chainlist.org/?search=passet)
2. Get tokens: [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111)
3. Track transactions: [Block Explorer](http://blockscout-passet-hub.parity-testnet.parity.io/)

## Development

### Project Structure

```
shaz/
├── contracts/           # Solidity contracts
│   ├── contracts/      # Donate.sol
│   └── @README.md      # Contract docs
├── frontend/           # React app
│   ├── src/
│   └── @README.md      # Frontend docs
└── package.json
```

### Scripts

```bash
# Root
bun start                  # Start dev server
bun run deploy-contract    # Deploy contract + generate types
bun run build              # Build for production

# Contracts
cd contracts
bun run compile            # Compile contracts
bun run deploy-contract    # Deploy to Paseo
bun run test               # Run tests

# Frontend
cd frontend
bun run dev                # Dev server
bun run generate           # Generate contract types
```

### Contract Functions

```solidity
// Donate to an artist
donateToArtist(string memory id) external payable

// Get artist count
getArtistsCount() public view returns (uint)

// Owner withdrawal
withdraw() external
```

### Frontend Integration

```typescript
import { donateConfig } from "./generated";
import { useWriteContract } from "wagmi";

const { writeContract } = useWriteContract();

writeContract({
  ...donateConfig,
  functionName: "donateToArtist",
  args: [artistId],
  value: parseEther(amount),
});
```

## Network

**Paseo Asset Hub Testnet**
- Chain ID: `420420422`
- RPC: `https://testnet-passet-hub-eth-rpc.polkadot.io`
- Explorer: [Blockscout](http://blockscout-passet-hub.parity-testnet.parity.io/)
- Currency: PAS

## Deployment

Deploy to Vercel:
```bash
vercel deploy
```

Reset contract deployment if needed:
```bash
cd contracts
rm -rf ignition/deployments
bun run deploy-contract
```

## Troubleshooting

**Web3Auth issues**: Check `VITE_WEB3AUTH_CLIENT_ID` env variable and network selection

**Contract deployment fails**: Verify private key format (no 0x prefix) and sufficient PAS balance

**Type errors**: Run `bun run generate` in frontend directory

## Resources

- [Polkadot Smart Contracts](https://docs.polkadot.com/develop/smart-contracts/)
- [Hardhat Docs](https://hardhat.org/docs)
- [Wagmi Docs](https://wagmi.sh/)
- [Web3Auth Docs](https://web3auth.io/docs)

## License

MIT