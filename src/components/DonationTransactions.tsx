import {useDonationTransactions} from "../hooks/useDonationTransactions";
import {formatAddress, passetHub} from "../wagmi-config";
import {BalanceDisplay} from "./ui/balance-display";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "./ui/table";
import {ExternalLink} from "lucide-react";
// Simple date formatter
const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

interface DonationTransactionsProps {
  contractAddress: `0x${string}`;
  artistId?: string;
}

const EXPLORER_BASE_URL =
  passetHub?.blockExplorers?.default?.url ?? "https://blockscout-passet-hub.parity-testnet.parity.io";

export function DonationTransactions({ contractAddress, artistId }: DonationTransactionsProps) {
  const { donations, isLoading, error } = useDonationTransactions(contractAddress);

  // Filter by artistId if provided
  const filteredDonations = artistId
    ? donations.filter((d) => d.artistId === artistId)
    : donations;

  // Group donations by artist and calculate totals
  const artistStats = filteredDonations.reduce((acc, donation) => {
    if (!acc[donation.artistId]) {
      acc[donation.artistId] = {
        artistId: donation.artistId,
        totalDonated: 0n,
        totalArtistReward: 0n,
        totalPlatformFee: 0n,
        transactionCount: 0,
      };
    }
    acc[donation.artistId].totalDonated += donation.donatedAmount;
    acc[donation.artistId].totalArtistReward += donation.artistReward;
    acc[donation.artistId].totalPlatformFee += donation.platformFee;
    acc[donation.artistId].transactionCount += 1;
    return acc;
  }, {} as Record<string, {
    artistId: string;
    totalDonated: bigint;
    totalArtistReward: bigint;
    totalPlatformFee: bigint;
    transactionCount: number;
  }>);

  const artistStatsArray = Object.values(artistStats);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
        <p className="text-sm text-muted-foreground">Loading donation transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
        <p className="text-sm text-destructive">Error loading donations: {error.message}</p>
      </div>
    );
  }

  if (filteredDonations.length === 0) {
    return (
      <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
        <p className="text-sm text-muted-foreground">No donation transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary by Artist */}
      {!artistId && artistStatsArray.length > 0 && (
        <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Donation Summary by Artist
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artist ID</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Total Donated</TableHead>
                <TableHead>Artist Reward</TableHead>
                <TableHead>Platform Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artistStatsArray.map((stat) => (
                <TableRow key={stat.artistId}>
                  <TableCell>
                    <span className="font-mono text-xs text-foreground">
                      {stat.artistId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {stat.transactionCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <BalanceDisplay
                      balance={stat.totalDonated}
                      showSymbol={true}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <BalanceDisplay
                      balance={stat.totalArtistReward}
                      showSymbol={true}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <BalanceDisplay
                      balance={stat.totalPlatformFee}
                      showSymbol={true}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Individual Transactions */}
      <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Recent Donation Transactions {artistId && `for ${artistId}`}
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Donated</TableHead>
                <TableHead>Artist Reward</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonations.map((donation) => (
                <TableRow key={donation.txHash}>
                  <TableCell>
                    <a
                      href={`${EXPLORER_BASE_URL}/tx/${donation.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {formatAddress(donation.txHash, 8, 6)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`${EXPLORER_BASE_URL}/address/${donation.donor}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-foreground hover:underline"
                    >
                      {formatAddress(donation.donor)}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">
                      {donation.artistId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <BalanceDisplay
                      balance={donation.donatedAmount}
                      showSymbol={true}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <BalanceDisplay
                      balance={donation.artistReward}
                      showSymbol={true}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <BalanceDisplay
                      balance={donation.platformFee}
                      showSymbol={true}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {donation.timestamp ? (
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(donation.timestamp)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

