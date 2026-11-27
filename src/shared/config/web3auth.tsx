import {CHAIN_NAMESPACES, WEB3AUTH_NETWORK} from "@web3auth/modal"
import {type Web3AuthContextConfig} from "@web3auth/modal/react"

// Web3Auth client ID: Set VITE_WEB3AUTH_CLIENT_ID in .env or uses default test key
// Get your own key from https://dashboard.web3auth.io
const clientId =
  import.meta.env.VITE_WEB3AUTH_CLIENT_ID

// Web3Auth's wagmi provider builds its own chain list and ignores the chains
// in `wagmiConfig`. Declare Polkadot Hub here, or reads/writes can silently
// target Web3Auth's default network instead.
const polkadotHubTestnet = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x190f1b41",
  rpcTarget: "https://eth-rpc-testnet.polkadot.io/",
  displayName: "Polkadot Hub TestNet",
  blockExplorerUrl: "https://blockscout-testnet.polkadot.io",
  ticker: "PAS",
  tickerName: "PAS",
  decimals: 18,
  logo: "",
}

const web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    disableAnalytics: true,
    chains: [polkadotHubTestnet],
    defaultChainId: polkadotHubTestnet.chainId,
  },
} as Web3AuthContextConfig

export default web3AuthContextConfig
