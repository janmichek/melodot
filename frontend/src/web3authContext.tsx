import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

// Web3Auth client ID: Set VITE_WEB3AUTH_CLIENT_ID in .env or uses default test key
// Get your own key from https://dashboard.web3auth.io
const clientId =
  import.meta.env.VITE_WEB3AUTH_CLIENT_ID

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};

export default web3AuthContextConfig;
