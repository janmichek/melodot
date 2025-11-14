import {useEffect, useState} from "react";
import {usePublicClient, useReadContract} from "wagmi";
import type {Abi} from "viem";
import {decodeFunctionData, encodeFunctionData} from "viem";
import {donateConfig} from "../generated";
import {BalanceDisplay} from "./ui/balance-display";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "./ui/table";

interface ArtistDonation {
  id: string;
  totalBalance: bigint;
  isClaimed: boolean;
  txCount: number;
}

interface DonationsTableProps {
  contractAddress: `0x${string}`;
}

export function DonationsTable({ contractAddress }: DonationsTableProps) {
  const [artistDonations, setArtistDonations] = useState<ArtistDonation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();

  const { data: count } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "getArtistsCount",
  });

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!publicClient || !count || count === 0n) {
        setArtistDonations([]);
        return;
      }

      setIsLoading(true);
      try {
        // Get all artist IDs
        const idPromises = [];
        for (let i = 0; i < Number(count); i++) {
          idPromises.push(
            publicClient.readContract({
              address: contractAddress,
              abi: donateConfig.abi as Abi,
              functionName: "artistIds",
              args: [i],
            }),
          );
        }

        const artistIds = await Promise.all(idPromises);

        // Get artist data
        const dataPromises = (artistIds as string[]).map((artistId) =>
          publicClient.readContract({
            address: contractAddress,
            abi: donateConfig.abi as Abi,
            functionName: "artists",
            args: [artistId],
          }),
        );

        const artistDataResults = await Promise.all(dataPromises);

        // Get function selector for donateToArtist to identify transactions
        // Function selector is the first 4 bytes of the keccak256 hash of the function signature
        // donateToArtist(string) -> keccak256("donateToArtist(string)") -> first 4 bytes
        // We'll compute it by encoding with a dummy value
        let donateToArtistSelector: string;
        try {
          const encoded = encodeFunctionData({
            abi: donateConfig.abi as Abi,
            functionName: "donateToArtist",
            args: ["dummy"], // Dummy value to get selector
          });
          donateToArtistSelector = encoded.slice(0, 10); // First 4 bytes (8 hex chars + 0x)
        } catch {
          // Fallback: manually computed selector (should match)
          donateToArtistSelector = "0x"; // Will be computed from actual transactions
        }

        // Fetch transaction counts for each artist by getting contract transactions
        // Note: This is a simplified approach. For production, consider using an indexer
        // or adding events to the contract for more efficient querying
        const txCounts = await Promise.all(
          (artistIds as string[]).map(async (artistId) => {
            try {
              // Try to get transactions from block explorer API
              // For Blockscout, we can use the API endpoint
              const explorerUrl = `https://blockscout-passet-hub.parity-testnet.parity.io/api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&sort=asc`;
              
              try {
                const response = await fetch(explorerUrl);
                const data = await response.json();
                
                if (data.status === "1" && data.result) {
                  // Filter transactions that call donateToArtist with this artistId
                  const donateTxs = data.result.filter((tx: any) => {
                    if (!tx.input || tx.input.length < 10) return false;
                    const selector = tx.input.slice(0, 10);
                    
                    // Check if it's a donateToArtist call
                    if (donateToArtistSelector && donateToArtistSelector !== "0x" && 
                        selector.toLowerCase() !== donateToArtistSelector.toLowerCase()) {
                      return false;
                    }
                    
                    // Try to decode and check if artistId matches
                    try {
                      const decoded = decodeFunctionData({
                        abi: donateConfig.abi as Abi,
                        data: tx.input as `0x${string}`,
                      });
                      return decoded.functionName === "donateToArtist" &&
                             decoded.args?.[0] === artistId;
                    } catch {
                      // If decoding fails, we can't verify the artistId
                      // Skip this transaction if we can't decode it
                      return false;
                    }
                  });
                  
                  return donateTxs.length;
                }
              } catch (apiError) {
                console.error(`Error fetching from explorer API for artist ${artistId}:`, apiError);
              }
              
              // Fallback: return 0 if we can't fetch
              return 0;
            } catch (error) {
              console.error(`Error fetching tx count for artist ${artistId}:`, error);
              return 0;
            }
          })
        );

        const items = (artistIds as string[]).map((artistId, index) => {
          const [totalBalance, isClaimed] = artistDataResults[index] as [bigint, boolean];
          return {
            id: artistId,
            totalBalance,
            isClaimed,
            txCount: txCounts[index] || 0,
          };
        });

        setArtistDonations(items);
      } catch (error) {
        console.error("Failed to fetch artist data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [count, publicClient, contractAddress]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
        <p className="text-sm text-muted-foreground">Loading donations...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Donations by Artist
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Artist ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Donated</TableHead>
            <TableHead>Transactions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artistDonations.map((artist) => (
            <TableRow key={artist.id}>
              <TableCell>
                <span className="font-mono text-xs text-foreground">
                  {artist.id}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={
                    artist.isClaimed
                      ? "rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-500"
                      : "rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600"
                  }
                >
                  {artist.isClaimed ? "Claimed" : "Available"}
                </span>
              </TableCell>
              <TableCell>
                <BalanceDisplay
                  balance={artist.totalBalance}
                  showSymbol={true}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {artist.txCount}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

