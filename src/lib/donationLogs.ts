import type {PublicClient} from "viem"

export const DONATION_MADE_EVENT = {
  type: "event",
  name: "DonationMade",
  inputs: [
    {indexed: true, name: "donor", type: "address"},
    {indexed: true, name: "artistId", type: "string"},
    {indexed: false, name: "donatedAmount", type: "uint256"},
    {indexed: false, name: "artistFee", type: "uint256"},
    {indexed: false, name: "platformFee", type: "uint256"},
  ],
} as const

export interface DonationMadeLog {
  args: {
    donor?: `0x${string}` | null
    donatedAmount?: bigint | null
    artistFee?: bigint | null
    platformFee?: bigint | null
  }
  blockNumber: bigint | null
  transactionHash: `0x${string}` | null
}

interface FetchLogsOptions {
  /** Explicit start block. Defaults to `latest - windowBlocks`. */
  fromBlock?: bigint
  /** How far back to scan when `fromBlock` is omitted. Default 10_000n. */
  windowBlocks?: bigint
  /** Max blocks per `eth_getLogs` call. Default 2_000n. */
  chunkBlocks?: bigint
  /**
   * Expected chain id. When set, the RPC's `eth_chainId` is verified first —
   * an endpoint serving a different chain would otherwise return silently
   * empty logs for our contract address instead of an error.
   */
  expectedChainId?: number
}

/**
 * Fetch `DonationMade` logs via RPC in small bounded chunks.
 *
 * A single `eth_getLogs` from `0x0` to `latest` is rejected by most
 * Passet/Polkadot Hub RPCs (response too large / timeout, surfaced as a
 * `NetworkError`). Bounding the range and paging it in chunks keeps each
 * request small enough to succeed.
 */
export async function fetchDonationMadeLogs(
  client: PublicClient,
  contractAddress: `0x${string}`,
  opts?: FetchLogsOptions,
): Promise<DonationMadeLog[]> {
  const windowBlocks = opts?.windowBlocks ?? 10_000n
  const chunkBlocks = opts?.chunkBlocks ?? 2_000n

  // Fail fast on a wrong-chain RPC: fallback lists mix endpoints that may
  // serve different chains, and querying our contract on the wrong chain
  // returns empty data instead of an error.
  if (opts?.expectedChainId !== undefined) {
    const chainId = await client.getChainId()
    if (chainId !== opts.expectedChainId) {
      throw new Error(
        `Wrong network: RPC serves chain ${chainId}, but the app expects Polkadot Hub TestNet (${opts.expectedChainId}). ` +
          `Switch your wallet to chain ${opts.expectedChainId}.`,
      )
    }
  }

  // Needs `latest` to bound the range — if the RPC is down this throws
  // and callers surface it via their error UI.
  const latest = await client.getBlockNumber()

  let start = opts?.fromBlock ?? latest - windowBlocks
  if (start < 0n) {start = 0n}

  const ranges: Array<{from: bigint; to: bigint}> = []
  for (let from = start; from <= latest; from += chunkBlocks) {
    let to = from + chunkBlocks - 1n
    if (to > latest) {to = latest}
    ranges.push({from, to})
  }

  // Fetch chunks concurrently — sequentially they keep the network busy
  // long enough to break `networkidle`-based loading states.
  const chunks = await Promise.all(
    ranges.map(async ({from, to}) => {
      try {
        return (await client.getLogs({
          address: contractAddress,
          event: DONATION_MADE_EVENT,
          fromBlock: from,
          toBlock: to,
        })) as unknown as DonationMadeLog[]
      } catch (err) {
        throw new Error(
          `eth_getLogs failed for blocks ${from}–${to}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        )
      }
    }),
  )
  return chunks.flat()
}
