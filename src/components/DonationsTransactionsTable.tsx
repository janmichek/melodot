import {useDonationTransactions} from "@/hooks/useDonationTransactions";
import {RecentDonationTransactions} from "@/components/RecentDonationTransactions";
import {DonationsArtistsTable} from "@/components/DonationsArtistsTable";
import {DonationsDonorsTable} from "@/components/DonationsDonorsTable";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

interface DonationTransactionsProps {
  contractAddress: `0x${string}`;
  artistId?: string;
}

export function DonationsTransactionsTable({
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

  // If filtering by artist, show only transactions (no tabs)
  if (artistId) {
    return (
      <RecentDonationTransactions
        donations={filteredDonations}
        artistId={artistId}
      />
    );
  }

  return (
    <Tabs defaultValue="transactions" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="artists">Artists</TabsTrigger>
        <TabsTrigger value="donors">Donors</TabsTrigger>
      </TabsList>
      <TabsContent value="transactions" className="mt-4">
        <RecentDonationTransactions
          donations={filteredDonations}
          artistId={artistId}
        />
      </TabsContent>
      <TabsContent value="artists" className="mt-4">
        <DonationsArtistsTable donations={filteredDonations} contractAddress={contractAddress} />
      </TabsContent>
      <TabsContent value="donors" className="mt-4">
        <DonationsDonorsTable donations={filteredDonations} limit={10} />
      </TabsContent>
    </Tabs>
  );
}

