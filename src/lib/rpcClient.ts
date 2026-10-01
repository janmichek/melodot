import {createPublicClient, fallback, http} from "viem"
import {passetHub} from "@/wagmi-config"

const DIRECT_UPSTREAMS = [
  // Polkadot Hub TestNet (chain 420420417). The legacy Passet Hub endpoint
  // (chain 420420422) is retired and has been removed.
  "https://eth-rpc-testnet.polkadot.io/",
  "https://services.polkadothub-rpc.com/testnet",
]

/**
 * Chain reads that do not depend on the browser reaching a public RPC host.
 *
 * Web3Auth injects its own RPC URL into the wagmi public client, and public
 * RPC hosts are frequently unreachable straight from browsers (CORS / DNS /
 * filtering → viem `NetworkError`). This client tries the same-origin
 * `/api/rpc` proxy first (server-side forwarding has none of those issues)
 * and falls back to the direct upstream RPCs (covers local dev without /api).
 */
export const proxyPublicClient = createPublicClient({
  chain: passetHub,
  transport: fallback(
    [
      http("/api/rpc", {
        batch: true,
        timeout: 45_000,
        retryCount: 0,
      }),
      ...DIRECT_UPSTREAMS.map((url) =>
        http(url, {
          batch: true,
          timeout: 15_000,
          retryCount: 1,
        }),
      ),
    ],
    {retryCount: 1, retryDelay: 500},
  ),
})
