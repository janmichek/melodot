import {createConfig, http} from "wagmi"
import {mainnet} from "wagmi/chains"

export const passetHub = {
  id: 420420422,
  name: "Passet Hub",
  nativeCurrency: {
    name: "PAS",
    symbol: "PAS",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-passet-hub-eth-rpc.polkadot.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-testnet.polkadot.io",
    },
  },
  faucetUrl: "https://faucet.polkadot.io/?parachain=1111",
} as const

export const wagmiConfig = createConfig({
  chains: [passetHub, mainnet],
  transports: {
    [passetHub.id]: http(passetHub.rpcUrls.default.http[0]),
    [mainnet.id]: http(),
  },
})

/**
 * Format PAS balance from Wei to human-readable format
 * @param balance - Balance in Wei (bigint, number, or string)
 * @returns Formatted balance as string (e.g., "1.23")
 */
export const formatPasBalance = (balance: bigint | number | string): string => {
  const decimals = passetHub.nativeCurrency.decimals
  const numBalance = typeof balance === 'bigint' ? Number(balance) : typeof balance === 'string' ? Number(balance) : balance
  return (numBalance / 10 ** decimals).toFixed(2)
}

/**
 * Format an Ethereum address for display (short format)
 * @param address - Full Ethereum address
 * @param startChars - Number of characters to show at start (default: 4)
 * @param endChars - Number of characters to show at end (default: 3)
 * @returns Formatted address (e.g., "0x1234...5678")
 */
export const formatAddress = (address: string, startChars: number = 4, endChars: number = 3): string => {
  if (!address || address.length < startChars + endChars) {
    return address
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export const CURRENCY_SYMBOL = passetHub.nativeCurrency.symbol
export const EXPLORER_BASE_URL = passetHub.blockExplorers.default.url
