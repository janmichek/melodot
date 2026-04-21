import {createConfig, http} from "wagmi"
import {mainnet} from "wagmi/chains"

export const polkadotTestnet = {
  id: 420420417,
  name: "Passet Hub",
  nativeCurrency: {
    name: "PAS",
    symbol: "PAS",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://services.polkadothub-rpc.com/testnet"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-testnet.polkadot.io",
    },
  },
  faucetUrl: "https://faucet.polkadot.io/",
} as const

export const wagmiConfig = createConfig({
  chains: [polkadotTestnet, mainnet],
  transports: {
    [polkadotTestnet.id]: http(polkadotTestnet.rpcUrls.default.http[0]),
    [mainnet.id]: http(),
  },
})

/**
 * Format PAS balance from Wei to human-readable format
 * @param balance - Balance in Wei (bigint, number, or string)
 * @returns Formatted balance as string (e.g., "1.23")
 */
export const formatPasBalance = (balance: bigint | number | string): string => {
  const decimals = polkadotTestnet.nativeCurrency.decimals
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

export const CURRENCY_SYMBOL = polkadotTestnet.nativeCurrency.symbol
export const EXPLORER_BASE_URL = polkadotTestnet.blockExplorers.default.url
