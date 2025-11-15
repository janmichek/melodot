import {useEffect, useState} from "react";
import {usePublicClient, useWriteContract} from "wagmi";
import {donateConfig} from "@/generated";
import {CURRENCY_SYMBOL, EXPLORER_BASE_URL} from "@/wagmi-config";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {CheckCircle2, ExternalLink} from "lucide-react";
import type {Abi} from "viem";
import {parseEther} from "viem";
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext";
import {useQueryClient} from "@tanstack/react-query";

interface Artist {
  id: string;
  name: string;
  url: string;
}

interface DonationFormProps {
  artists?: Artist[] | null;
  onSuccess?: () => void;
  onDiscoverAgain?: () => void;
}

interface DonationTx {
  hash: `0x${string}`;
  artistId: string;
  artistName: string;
  confirmed: boolean;
}

export function DonationForm({ artists, onSuccess, onDiscoverAgain }: DonationFormProps) {
  // Safely handle undefined/null artists array
  const safeArtists = Array.isArray(artists) ? artists : [];
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(
    new Set(safeArtists.length > 0 ? safeArtists.map(a => a.id) : [])
  );
  const [isDonating, setIsDonating] = useState(false);
  const [donationTxs, setDonationTxs] = useState<DonationTx[]>([]);
  const [allConfirmed, setAllConfirmed] = useState(false);
  const { isConnected, connect, contractAddress, address } = useWeb3AuthContext();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();

  // Early return if no artists (after hooks)
  if (safeArtists.length === 0) {
    return null;
  }

  const {
    writeContractAsync,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  // Helper function to invalidate balance queries
  const invalidateBalance = (userAddress: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        if (!Array.isArray(queryKey) || queryKey[0] !== 'balance') {
          return false;
        }
        const params = queryKey[1];
        if (typeof params !== 'object' || params === null || !('address' in params)) {
          return false;
        }
        const queryAddress = params.address;
        return (
          typeof queryAddress === 'string' &&
          queryAddress.toLowerCase() === userAddress.toLowerCase()
        );
      },
    });
  };

  // Call onSuccess callback and refetch balance when all transactions are confirmed
  useEffect(() => {
    if (allConfirmed && address && donationTxs.length > 0) {
      invalidateBalance(address);
      onSuccess?.();
    }
  }, [allConfirmed, onSuccess, queryClient, address, donationTxs.length]);

  const toggleArtist = (artistId: string) => {
    const newSelected = new Set(selectedArtists);
    if (newSelected.has(artistId)) {
      newSelected.delete(artistId);
    } else {
      newSelected.add(artistId);
    }
    setSelectedArtists(newSelected);
  };

  const donateToAll = async () => {
    if (!isConnected) {
      void connect();
      return;
    }

    if (!selectedAmount || selectedArtists.size === 0 || !publicClient || safeArtists.length === 0) return;
    if (isDonating || isWriting) return;

    try {
      setIsDonating(true);
      setAllConfirmed(false);
      const txs: DonationTx[] = [];
      
      // Create a map for quick artist name lookup
      const artistMap = new Map(safeArtists.map(a => [a.id, a.name]));
      
      // Donate to each selected artist sequentially
      for (const artistId of selectedArtists) {
        try {
          // Write contract and get hash
          const hash = await writeContractAsync({
            address: contractAddress,
            abi: donateConfig.abi as Abi,
            functionName: "donateToArtist",
            args: [artistId],
            value: parseEther(selectedAmount.toString()),
          });
          
          // Add transaction to list (unconfirmed)
          const tx: DonationTx = {
            hash,
            artistId,
            artistName: artistMap.get(artistId) || artistId,
            confirmed: false,
          };
          txs.push(tx);
          setDonationTxs([...txs]);
          
          // Wait for transaction to be confirmed
          await publicClient.waitForTransactionReceipt({
            hash,
          });
          
          // Mark as confirmed
          tx.confirmed = true;
          setDonationTxs([...txs]);
          
        } catch (err) {
          console.error(`Error donating to artist ${artistId}:`, err);
          // Continue with other artists even if one fails
        }
      }
      
      // Check if all transactions are confirmed
      const allTxsConfirmed = txs.every(tx => tx.confirmed);
      setAllConfirmed(allTxsConfirmed);
      
    } catch (err) {
      console.error("Error during donation process:", err);
    } finally {
      setIsDonating(false);
    }
  };

  const selectedCount = selectedArtists.size;
  const totalDonation = selectedAmount && selectedCount > 0 ? selectedAmount * selectedCount : 0;

  return (
    <div className="space-y-4">
      {/* Artist Selection - First */}
      {safeArtists.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Select artists to donate to
          </label>
          <div className="flex flex-wrap gap-2">
            {safeArtists.map((artist) => {
              const isSelected = selectedArtists.has(artist.id);
              return (
                <label
                  key={artist.id}
                  htmlFor={`artist-${artist.id}`}
                  className={`relative inline-flex items-center ${
                    isDonating || isWriting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                >
                  <Checkbox
                    id={`artist-${artist.id}`}
                    checked={isSelected}
                    onChange={(e) => {
                      if (!isDonating && !isWriting) {
                        toggleArtist(artist.id);
                      }
                    }}
                    disabled={isDonating || isWriting}
                    className="sr-only peer"
                  />
                  <span
                    className={`
                      inline-flex items-center justify-center px-4 py-2 rounded-md border text-sm font-medium transition-all
                      ${isSelected
                        ? "border-blue-600 bg-blue-600 text-white dark:border-blue-700 dark:bg-blue-700"
                        : "border-border bg-background hover:bg-accent"
                      }
                    `}
                  >
                    {artist.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Amount Selection - Second */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80">
          Select donation amount per artist
        </label>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 10, 50, 100].map((amount) => (
            <Button
              key={amount}
              type="button"
              onClick={() => setSelectedAmount(amount)}
              disabled={isDonating || isWriting}
              variant={selectedAmount === amount ? "default" : "outline"}
              size="lg"
              className="min-w-[100px] font-semibold"
            >
              {`${amount} ${CURRENCY_SYMBOL}`}
            </Button>
          ))}
        </div>
      </div>

      {/* Calculation & Donate Button - Only show when not pending and not successful */}
      {selectedAmount && selectedCount > 0 && !isDonating && !isWriting && !allConfirmed && (
        <div className="space-y-3 pt-2 border-t">
          <div className="text-sm text-foreground/70 space-y-1">
            <div className="flex justify-between">
              <span>Amount per artist:</span>
              <span className="font-semibold">{selectedAmount} {CURRENCY_SYMBOL}</span>
            </div>
            <div className="flex justify-between">
              <span>Number of artists:</span>
              <span className="font-semibold">{selectedCount}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t">
              <span>Total to donate:</span>
              <span>{totalDonation} {CURRENCY_SYMBOL}</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={donateToAll}
            disabled={!isConnected || !selectedAmount || selectedCount === 0}
            size="lg"
            className="w-full font-bold text-lg py-6"
          >
            Donate {totalDonation} {CURRENCY_SYMBOL}
          </Button>
        </div>
      )}

      {/* Processing Status - Yellow */}
      {(isDonating || isWriting) && (
        <Alert className="mt-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <div className="h-4 w-4 rounded-full border-2 border-yellow-600 border-t-transparent animate-spin mt-0.5 shrink-0" />
            <div className="flex-1">
              <AlertTitle className="mb-2">Processing donations...</AlertTitle>
              <AlertDescription>
                <p className="text-sm text-foreground/80">
                  Processing donation{donationTxs.length > 1 ? 's' : ''}... ({donationTxs.filter(tx => tx.confirmed).length}/{selectedCount})
                </p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Success with All Transaction Hashes */}
      {allConfirmed && donationTxs.length > 0 && (
        <>
          <Alert variant="success" className="mt-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle className="mb-3">
              Donated {totalDonation} {CURRENCY_SYMBOL} to {selectedCount} artist{selectedCount > 1 ? 's' : ''}!
            </AlertTitle>
            <AlertDescription className="space-y-3">
              <p className="text-sm font-medium">
                View all transactions on the block explorer:
              </p>
              <div className="space-y-2">
                {donationTxs.map((tx, index) => (
                  <div key={tx.hash} className="flex items-center justify-between gap-2 p-2 bg-background/50 rounded border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.artistName}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">{tx.hash}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs shrink-0"
                      asChild
                    >
                      <a
                        href={`${EXPLORER_BASE_URL}/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View transaction ${index + 1} on block explorer`}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
          
          {/* Discover Again Button */}
          {onDiscoverAgain && (
            <Button
              onClick={onDiscoverAgain}
              variant="ghost"
              size="lg"
              className="w-full mt-4"
            >
              ← Discover again
            </Button>
          )}
        </>
      )}
    </div>
  );
}
