import {BalanceDisplay} from "./ui/balance-display";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "./ui/table";
import {Donation} from "./RecentDonationTransactions";

interface ArtistStats {
  artistId: string;
  totalDonated: bigint;
  totalArtistReward: bigint;
  totalPlatformFee: bigint;
  transactionCount: number;
}

interface DonationSummaryByArtistProps {
  donations: Donation[];
}

export function DonationsArtistsTable({
  donations,
}: DonationSummaryByArtistProps) {
  // Group donations by artist and calculate totals
  const artistStats = donations.reduce(
    (acc, donation) => {
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
    },
    {} as Record<string, ArtistStats>
  );

  const artistStatsArray = Object.values(artistStats);

  if (artistStatsArray.length === 0) {
    return null;
  }

  return (
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
  );
}
