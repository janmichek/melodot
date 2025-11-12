// @ts-check

import {useEffect, useMemo, useState} from "react";
import {formatEther} from "viem";
import {usePublicClient} from "wagmi";
import {useWeb3AuthContext} from "../App";
import {donateConfig} from "../generated";
import {passetHub} from "../wagmi-config";
import {Spinner} from "@/components/ui/spinner";

const EXPLORER_BASE_URL = passetHub?.blockExplorers?.default?.url ??
  "https://blockscout-passet-hub.parity-testnet.parity.io";

export function Donations() {
  const { contractAddress } = useWeb3AuthContext();
  const publicClient = usePublicClient();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    if (!contractAddress || !publicClient) {
      setDonations([]);
      return;
    }

    const loadDonations = async () => {
      setLoading(true);
      setError("");

      try {
        const countRaw = await publicClient.readContract({
          address: contractAddress,
          abi: donateConfig.abi,
          functionName: "getArtistsCount",
        });

        const count = typeof countRaw === "bigint" ? Number(countRaw) : Number(countRaw ?? 0);

        if (!Number.isFinite(count) || count <= 0) {
          if (!ignore) setDonations([]);
          return;
        }

        const entries = [];

        for (let index = 0; index < count; index++) {
          const artistId = await publicClient.readContract({
            address: contractAddress,
            abi: donateConfig.abi,
            functionName: "artistIds",
            args: [BigInt(index)],
          });

          if (typeof artistId !== "string") {
            continue;
          }

          const artistInfo = await publicClient.readContract({
            address: contractAddress,
            abi: donateConfig.abi,
            functionName: "getArtistInfo",
            args: [artistId],
          });

          const [balance = 0n, isClaimed = false] = Array.isArray(artistInfo) ? artistInfo : [];

          entries.push({
            artistId,
            balance: typeof balance === "bigint" ? balance : BigInt(balance ?? 0),
            isClaimed: Boolean(isClaimed),
          });
        }

        if (!ignore) {
          setDonations(entries);
        }
      } catch (err) {
        console.error("Failed to load donations", err);
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Unable to load donations.");
          setDonations([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDonations();

    return () => {
      ignore = true;
    };
  }, [contractAddress, publicClient]);

  const explorerLink = useMemo(() => {
    if (!contractAddress) return null;
    return `${EXPLORER_BASE_URL}/address/${contractAddress}?tab=txs`;
  }, [contractAddress]);

  if (!contractAddress) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Donations
        </h1>
        <p className="text-muted-foreground">
          Connect your wallet to view live donations.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Donations</h1>
          <p className="text-muted-foreground">
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

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner size="sm" />
          <span>Loading donations...</span>
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : donations.length === 0 ? (
        <div className="rounded-md border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          No donations on-chain yet. Check back after the first contribution.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-medium uppercase tracking-wide">
                Artist ID
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium uppercase tracking-wide">
                Balance (PAS)
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium uppercase tracking-wide">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium uppercase tracking-wide">
                Explorer
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
            {donations.map(({ artistId, balance, isClaimed }) => {
              const formattedBalance = Number.parseFloat(formatEther(balance)).toLocaleString(undefined, {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              });

              return (
                <tr key={artistId} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{artistId}</td>
                  <td className="px-4 py-3">{formattedBalance}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium">
                      {isClaimed ? "Claimed" : "Unclaimed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {explorerLink ? (
                      <a
                        href={explorerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        View Tx
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


