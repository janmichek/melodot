import {useEffect, useState} from "react"
import type {Abi} from "viem"
import {decodeFunctionData} from "viem"
import {donateConfig} from "@/generated"
import {fetchDonationMadeLogs} from "@/lib/donationLogs"
import {proxyPublicClient} from "@/lib/rpcClient"
import {passetHub} from "@/wagmi-config"
import type {DonationTransaction} from "@types"

export function useDonationTransactions(
  contractAddress: `0x${string}` | undefined,
  fromBlock?: bigint,
) {
  const [donations, setDonations] = useState<DonationTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  // Reads go through the same-origin RPC proxy, not the wallet-injected
  // public client (its RPC host is unreachable from browsers).
  const publicClient = proxyPublicClient

  useEffect(() => {
    if (!contractAddress) {
      setDonations([])
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const fetchDonations = async () => {
      try {
        // On-chain DonationMade events via RPC, scanned in small bounded
        // chunks (a single 0→latest eth_getLogs is rejected by the RPC).
        // No Blockscout REST dependency.
        const logs = await fetchDonationMadeLogs(publicClient, contractAddress, {
          fromBlock,
          windowBlocks: 10_000n,
          chunkBlocks: 2_000n,
          expectedChainId: passetHub.id,
        })

        if (cancelled) {return}

        if (logs.length === 0) {
          setDonations([])
          return
        }

        // artistId is `string indexed`, so the log topic only holds
        // keccak256(artistId). Recover the original ID from tx input.
        const txInputCache = new Map<string, `0x${string}`>()
        const getTxInput = async (hash: `0x${string}`) => {
          const cached = txInputCache.get(hash)
          if (cached) {return cached}
          const tx = await publicClient.getTransaction({hash})
          txInputCache.set(hash, tx.input)
          return tx.input
        }

        const donationTxs: DonationTransaction[] = []

        for (const log of logs) {
          // Skip pending logs (no hash/block yet)
          if (!log.transactionHash || log.blockNumber === null || log.blockNumber === undefined) {continue}
          const txHash = log.transactionHash
          const blockNumber = log.blockNumber
          const args = log.args
          try {
            const input = await getTxInput(txHash)
            const decoded = decodeFunctionData({
              abi: donateConfig.abi as Abi,
              data: input,
            })
            if (decoded.functionName !== "donateToArtist" || !decoded.args?.[0]) {continue}

            const artistId = decoded.args[0] as string
            const donatedAmount = args.donatedAmount ?? 0n

            donationTxs.push({
              txHash,
              donor: args.donor ?? "0x0000000000000000000000000000000000000000",
              artistId,
              donatedAmount,
              artistReward: args.artistFee ?? 0n,
              platformFee: args.platformFee ?? 0n,
              blockNumber,
            })
          } catch {
            continue
          }
        }

        // Best-effort timestamps (one block fetch per unique block).
        try {
          const uniqueBlocks = [...new Set(donationTxs.map((d) => d.blockNumber.toString()))]
          const timestamps = new Map<string, number>()
          await Promise.all(
            uniqueBlocks.map(async (b) => {
              try {
                const block = await publicClient.getBlock({blockNumber: BigInt(b)})
                timestamps.set(b, Number(block.timestamp))
              } catch {
                // ignore — timestamp stays undefined
              }
            }),
          )
          for (const d of donationTxs) {
            const ts = timestamps.get(d.blockNumber.toString())
            if (ts !== undefined) {d.timestamp = ts}
          }
        } catch {
          // ignore — timestamps are optional
        }

        // Sort by block number (newest first)
        donationTxs.sort((a, b) =>
          b.blockNumber > a.blockNumber ? 1 : b.blockNumber < a.blockNumber ? -1 : 0,
        )

        if (!cancelled) {setDonations(donationTxs)}
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch donations"))
          setDonations([])
        }
      } finally {
        if (!cancelled) {setIsLoading(false)}
      }
    }

    fetchDonations()
    return () => {
      cancelled = true
    }
  }, [publicClient, contractAddress, fromBlock])

  return {donations, isLoading, error}
}
