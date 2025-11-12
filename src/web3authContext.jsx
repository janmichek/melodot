// @ts-check

import {WEB3AUTH_NETWORK} from "@web3auth/modal";

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID;

/** @type {{ web3AuthOptions: { clientId: string | undefined, web3AuthNetwork: string } }} */
const web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};

export default web3AuthContextConfig;
