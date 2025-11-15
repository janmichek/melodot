import {DonationsTransactionsTable} from "./DonationsTransactionsTable";

interface DonationsListProps {
  contractAddress: `0x${string}`;
}

export function DonationsList({ contractAddress }: DonationsListProps) {
  return (
    <section
      className="flex flex-col gap-4 rounded-xl border border-border bg-muted/5 p-4 text-sm text-muted-foreground"
      data-testid="donations-list"
    >
      {/* Donation Transactions - Shows all transactions with donor addresses */}
      <DonationsTransactionsTable contractAddress={contractAddress} />
    </section>
  );
}



