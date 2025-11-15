import {formatAddress, passetHub} from "@/wagmi-config";
import {BalanceDisplay} from "@/components/ui/balance-display";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
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

const EXPLORER_BASE_URL = passetHub.blockExplorers.default.url

export interface Donation {
  txHash: string;
  donor: string;
  artistId: string;
  donatedAmount: bigint;
  artistReward: bigint;
  platformFee: bigint;
  timestamp?: number;
}

interface RecentDonationTransactionsProps {
  donations: Donation[];
  artistId?: string;
}

export function RecentDonationTransactions({
  donations,
  artistId,
}: RecentDonationTransactionsProps) {
  return (
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
            {donations.map((donation) => (
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
  );
}
