import {useMemo} from "react";
import {useWeb3AuthContext} from "../App";
import {passetHub} from "../wagmi-config";
import {DonationsList} from "@/components/DonationsList";

const EXPLORER_BASE_URL =
  passetHub?.blockExplorers?.default?.url ?? "https://blockscout-passet-hub.parity-testnet.parity.io";

export function Donations() {
  const { contractAddress } = useWeb3AuthContext();

  const explorerLink = useMemo(() => {
    if (!contractAddress) return null;
    return `${EXPLORER_BASE_URL}/address/${contractAddress}?tab=txs`;
  }, [contractAddress]);

  return (
    <section className="space-y-6 pb-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Donations</h1>
          <p className="text-sm text-muted-foreground">
            Live donations fetched directly from the contract.
          </p>
        </div>
        {explorerLink && (
          <a
            href={explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View Transactions
          </a>
        )}
      </header>

      {!contractAddress ? (
        <div className="space-y-2 rounded-md border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Connect your wallet to view live donations.</p>
        </div>
      ) : (
        <DonationsList contractAddress={contractAddress} />
      )}
    </section>
  );
}



