import {useDonationTransactions} from "../hooks/useDonationTransactions";
import {RecentDonationTransactions} from "./RecentDonationTransactions";
import {DonationSummaryByArtist} from "./DonationSummaryByArtist";
import {TopDonors} from "./TopDonors";

interface DonationTransactionsProps {
  contractAddress: `0x${string}`;
  artistId?: string;
}

export function DonationTransactions({
  contractAddress,
  artistId,
}: DonationTransactionsProps) {
  const { donations, isLoading, error } = useDonationTransactions(contractAddress);

  // Filter by artistId if provided
  const filteredDonations = artistId
    ? donations.filter((d) => d.artistId === artistId)
    : donations;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
        <p className="text-sm text-muted-foreground">
          Loading donation transactions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
        <p className="text-sm text-destructive">
          Error loading donations: {error.message}
        </p>
      </div>
    );
  }

  if (filteredDonations.length === 0) {
    return (
      <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
        <p className="text-sm text-muted-foreground">
          No donation transactions found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Donors - only show when not filtering by artist */}
      {!artistId && <TopDonors donations={filteredDonations} limit={10} />}

      {/* Summary by Artist - only show when not filtering by artist */}
      {!artistId && <DonationSummaryByArtist donations={filteredDonations} />}

      {/* Individual Transactions */}
      <RecentDonationTransactions
        donations={filteredDonations}
        artistId={artistId}
      />
    </div>
  );
}

