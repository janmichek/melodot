import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

const clientId =
  // This is a test-only key Provided by KitDot, get one from https://dashboard.web3auth.io
  import.meta.env.VITE_WEB3AUTH_CLIENT_ID ||
  "BJDsmOCjEJNO46dyNiB5ErcH-mVgMoi22VvKUHufsu3cCAne66z542DJVMMbf9rs4wUwsirOiO1RCWtswZnfXYg";

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};

export default web3AuthContextConfig;
