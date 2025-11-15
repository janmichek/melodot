import {EXPLORER_BASE_URL, formatAddress} from "@/wagmi-config";
import {BalanceDisplay} from "@/components/ui/balance-display";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Donation} from "@/components/RecentDonationTransactions";

interface DonorStats {
  donor: string;
  totalDonated: bigint;
  transactionCount: number;
}

interface DonationsDonorsTableProps {
  donations: Donation[];
  limit?: number;
}

export function DonationsDonorsTable({ donations, limit = 10 }: DonationsDonorsTableProps) {
  // Group donations by donor and calculate totals
  const donorStats = donations.reduce(
    (acc, donation) => {
      if (!acc[donation.donor]) {
        acc[donation.donor] = {
          donor: donation.donor,
          totalDonated: 0n,
          transactionCount: 0,
        };
      }
      acc[donation.donor].totalDonated += donation.donatedAmount;
      acc[donation.donor].transactionCount += 1;
      return acc;
    },
    {} as Record<string, DonorStats>
  );

  // Sort by total donated (descending) and take top N
  const topDonors = Object.values(donorStats)
    .sort((a, b) => {
      if (a.totalDonated > b.totalDonated) return -1;
      if (a.totalDonated < b.totalDonated) return 1;
      return 0;
    })
    .slice(0, limit);

  if (topDonors.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Top Donors
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Donor</TableHead>
            <TableHead>Total Donated</TableHead>
            <TableHead>Transactions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topDonors.map((donor, index) => (
            <TableRow key={donor.donor}>
              <TableCell>
                <span className="text-sm font-semibold text-foreground">
                  #{index + 1}
                </span>
              </TableCell>
              <TableCell>
                <a
                  href={`${EXPLORER_BASE_URL}/address/${donor.donor}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-foreground hover:underline"
                >
                  {formatAddress(donor.donor)}
                </a>
              </TableCell>
              <TableCell>
                <BalanceDisplay
                  balance={donor.totalDonated}
                  showSymbol={true}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {donor.transactionCount}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
