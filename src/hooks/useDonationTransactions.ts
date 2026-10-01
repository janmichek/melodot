import {useEffect, useState} from "react"
import {usePublicClient} from "wagmi"
import type {Abi} from "viem"
import {decodeFunctionData, encodeFunctionData} from "viem"
import {donateConfig} from "@/generated"
import type {DonationTransaction} from "@types"

export function useDonationTransactions(
  contractAddress: `0x${string}` | undefined,
  fromBlock?: bigint
) {
  const [donations, setDonations] = useState<DonationTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!publicClient || !contractAddress) {
      setDonations([])
      return
    }

    setIsLoading(true)
    setError(null)

    const fetchDonations = async () => {
      try {
        // Get function selector for donateToArtist
        const functionSelector = encodeFunctionData({
          abi: donateConfig.abi as Abi,
          functionName: "donateToArtist",
          args: [""],
        }).slice(0, 10) as `0x${string}`

        // Get start block
        const currentBlock = await publicClient.getBlockNumber()
        const startBlock = fromBlock || currentBlock - BigInt(10000)

        // Fetch platform fee info once
        const platformFeeInfo = await publicClient.readContract({
          address: contractAddress,
          abi: donateConfig.abi as Abi,
          functionName: "getPlatformFeeInfo",
        }) as readonly [`0x${string}`, number]
        const feeBps = Number(platformFeeInfo[1])

        // Fetch transactions from Blockscout
        const explorerUrl = `https://blockscout-passet-hub.parity-testnet.parity.io/api?module=account&action=txlist&address=${contractAddress}&startblock=${startBlock.toString()}&endblock=99999999&sort=desc`
        const response = await fetch(explorerUrl)

        // Check HTTP status before parsing
        if (!response.ok) {
          throw new Error(`Blockscout API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (data.status !== "1" || !Array.isArray(data.result)) {
          // API returned success but no results - this is normal for new contracts
          setDonations([])
          return
        }

        const donationTxs: DonationTransaction[] = []

        for (const tx of data.result) {
          if (!tx.input || tx.input.length < 10) {continue}
          if (tx.input.slice(0, 10).toLowerCase() !== functionSelector.toLowerCase()) {continue}

          const value = BigInt(tx.value || "0")
          if (value === 0n) {continue}

          try {
            const decoded = decodeFunctionData({
              abi: donateConfig.abi as Abi,
              data: tx.input as `0x${string}`,
            })

            if (decoded.functionName !== "donateToArtist" || !decoded.args?.[0]) {continue}

            const artistId = decoded.args[0] as string
            const artistReward = (value * BigInt(10_000 - feeBps)) / 10_000n
            const platformFee = value - artistReward

            donationTxs.push({
              txHash: tx.hash as `0x${string}`,
              donor: tx.from as `0x${string}`,
              artistId,
              donatedAmount: value,
              artistReward,
              platformFee,
              blockNumber: BigInt(tx.blockNumber || "0"),
              timestamp: tx.timeStamp ? Number(tx.timeStamp) : undefined,
            })
          } catch {
            continue
          }
        }

        // Sort by block number (newest first)
        donationTxs.sort((a, b) => 
          b.blockNumber > a.blockNumber ? 1 : b.blockNumber < a.blockNumber ? -1 : 0
        )

        setDonations(donationTxs)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch donations"))
        setDonations([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDonations()
  }, [publicClient, contractAddress, fromBlock])

  return {donations, isLoading, error}
}

