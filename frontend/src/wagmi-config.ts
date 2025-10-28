import { http, createConfig } from "wagmi";
import { type Chain } from "viem";
import { mainnet } from "wagmi/chains";
export const passetHub = {
  id: 420420422,
  name: "Passet Hub",
  nativeCurrency: {
    name: "PAS",
    symbol: "PAS",
    decimals: 10,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-passet-hub-eth-rpc.polkadot.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-passet-hub.parity-testnet.parity.io",
    },
  },
} as const satisfies Chain;

export const wagmiConfig = createConfig({
  chains: [passetHub, mainnet],
  transports: {
    [passetHub.id]: http(passetHub.rpcUrls.default.http[0]),
    [mainnet.id]: http(),
  },
});

export const formatPasBalance = (balance: bigint | number | string): string => {
  const decimals = passetHub.nativeCurrency.decimals;
  const numBalance = typeof balance === 'bigint' ? Number(balance) : typeof balance === 'string' ? Number(balance) : balance;
  return (numBalance / 10 ** decimals).toFixed(2);
};

export const CURRENCY_SYMBOL = passetHub.nativeCurrency.symbol;
