import { WEB3AUTH_NETWORK, CHAIN_NAMESPACES } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

// Web3Auth client ID: Set VITE_WEB3AUTH_CLIENT_ID in .env or uses default test key
// Get your own key from https://dashboard.web3auth.io
const clientId =
  import.meta.env.VITE_WEB3AUTH_CLIENT_ID

const web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x190F0016", // 420420422 in hex
      rpcTarget: "https://testnet-passet-hub-eth-rpc.polkadot.io",
      displayName: "Passet Hub",
      blockExplorerUrl: "https://blockscout-passet-hub.parity-testnet.parity.io",
      ticker: "PAS",
      tickerName: "PAS",
    },
  },
} as Web3AuthContextConfig;

export default web3AuthContextConfig;
