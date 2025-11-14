import {useEffect, useState} from "react";
import {usePublicClient} from "wagmi";
import type {Abi} from "viem";
import {decodeFunctionData, encodeFunctionData} from "viem";
import {donateConfig} from "../generated";

export interface DonationTransaction {
  txHash: `0x${string}`;
  donor: `0x${string}`;
  artistId: string;
  donatedAmount: bigint;
  artistReward: bigint;
  platformFee: bigint;
  blockNumber: bigint;
  timestamp?: number;
}

/**
 * Hook to fetch donation transactions from the blockchain
 * Fetches transactions that call donateToArtist and decodes them
 */
export function useDonationTransactions(
  contractAddress: `0x${string}` | undefined,
  fromBlock?: bigint
) {
  const [donations, setDonations] = useState<DonationTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchDonations = async () => {
      if (!publicClient || !contractAddress) {
        setDonations([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get the function selector for donateToArtist
        const encoded = encodeFunctionData({
          abi: donateConfig.abi as Abi,
          functionName: "donateToArtist",
          args: ["dummy"],
        });
        const functionSelector = encoded.slice(0, 10) as `0x${string}`;

        // Get current block number
        const currentBlock = await publicClient.getBlockNumber();
        const startBlock = fromBlock || currentBlock - BigInt(10000); // Default to last 10k blocks

        // Fetch transactions from Blockscout API (more reliable than RPC for historical data)
        const explorerUrl = `https://blockscout-passet-hub.parity-testnet.parity.io/api?module=account&action=txlist&address=${contractAddress}&startblock=${startBlock.toString()}&endblock=99999999&sort=desc`;

        const response = await fetch(explorerUrl);
        const data = await response.json();

        if (data.status === "1" && Array.isArray(data.result)) {
          const donationTxs: DonationTransaction[] = [];

          // Process each transaction
          for (const tx of data.result) {
            // Check if it's a donateToArtist call
            if (!tx.input || tx.input.length < 10) continue;
            
            const selector = tx.input.slice(0, 10).toLowerCase();
            if (selector !== functionSelector.toLowerCase()) continue;

            try {
              const functionData = tx.input as `0x${string}`;
              
              // Extract value from transaction
              const value = BigInt(tx.value || "0");
              if (value === 0n) continue;

              // Decode function input to get artistId
              let artistId: string;
              try {
                const decoded = decodeFunctionData({
                  abi: donateConfig.abi as Abi,
                  data: functionData,
                });

                if (decoded.functionName === "donateToArtist" && decoded.args?.[0]) {
                  artistId = decoded.args[0] as string;
                } else {
                  continue; // Not a donateToArtist call
                }
              } catch (decodeError) {
                // If decoding fails, skip this transaction
                console.error(`Error decoding function data for tx ${tx.hash}:`, decodeError);
                continue;
              }

              // Get platform fee info to calculate rewards
              const platformFeeInfo = await publicClient.readContract({
                address: contractAddress,
                abi: donateConfig.abi as Abi,
                functionName: "getPlatformFeeInfo",
              }) as readonly [`0x${string}`, number];

              const feeBps = Number(platformFeeInfo[1]);
              const platformFee = (value * BigInt(feeBps)) / 10000n;
              const artistReward = value - platformFee;
              
              donationTxs.push({
                txHash: tx.hash as `0x${string}`,
                donor: tx.from as `0x${string}`,
                artistId,
                donatedAmount: value,
                artistReward,
                platformFee,
                blockNumber: BigInt(tx.blockNumber || "0"),
                timestamp: tx.timeStamp ? Number(tx.timeStamp) : undefined,
              });
            } catch (error) {
              console.error(`Error processing tx ${tx.hash}:`, error);
              continue;
            }
          }

          // Sort by block number (newest first)
          const sortedDonations = donationTxs.sort((a, b) => {
            if (b.blockNumber !== a.blockNumber) {
              return b.blockNumber > a.blockNumber ? 1 : -1;
            }
            return 0;
          });

          setDonations(sortedDonations);
        } else {
          setDonations([]);
        }
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch donations"));
        setDonations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, [publicClient, contractAddress, fromBlock]);

  return { donations, isLoading, error };
}

