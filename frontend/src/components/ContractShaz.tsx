import {donateConfig} from "../generated";
import {useReadContract, useWriteContract, useWaitForTransactionReceipt} from "wagmi";
import {useState, useEffect} from "react";
import type {Abi} from "viem";
import {parseEther} from "viem";

export function ContractShaz(params: {
  contractAddress: `0x${string}`;
  userAddresses?: readonly `0x${string}`[];
}) {
  const [artistId, setArtistId] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queryArtistId, setQueryArtistId] = useState("");
  const [artistsToDisplay, setArtistsToDisplay] = useState<string[]>([]);

  // Read contract balance
  const {data: contractBalance, isLoading, error, refetch} = useReadContract({
    address: params.contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "balance",
  });

  // Read artist data
  const {data: artistData, refetch: refetchArtist} = useReadContract({
    address: params.contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "artists",
    args: [0]
  });


  const {data: count} = useReadContract({
    address: params.contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "getArtistsCount",
  });

  // Write contract hook
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError
  } = useWriteContract();

  // Wait for transaction confirmation
  const {isLoading: isConfirming, isSuccess: isConfirmed} = useWaitForTransactionReceipt({
    hash,
  });

  // Handle form submission
  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId.trim() || !donationAmount.trim()) return;

    try {
      setIsSubmitting(true);
      writeContract({
        address: params.contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "donateToArtist",
        args: [artistId],
        value: parseEther(donationAmount),
      });

      // Add artist to display list if not already there
      if (!artistsToDisplay.includes(artistId)) {
        setArtistsToDisplay([...artistsToDisplay, artistId]);
      }
    } catch (err) {
      console.error("Error donating:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refetch balance after successful transaction
  if (isConfirmed) {
    refetch();
    setArtistId("");
    setDonationAmount("");
  }

  // Error state
  if (error) {
    return (
      <div data-testid="contract-error">
        <p className="error">
          Error loading contract at{" "}
          <span className="font-bold">{params.contractAddress}</span>
        </p>
        <code className="code-pre-wrap">{error.message}</code>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <p>
        Loading contract data for{" "}
        <span className="font-bold">{params.contractAddress}</span>...
      </p>
    );
  }

  return (
    <div data-testid="contract-data" className="max-w-600">
      {count && Number(count) > 0 && (
        <div className="artists-list-section">
          <h3 className="artists-list-title">
            All Artists in Contract ({count.toString()})
          </h3>
          <div className="artists-list-container">
            {Array.from({length: Number(count)}, (_, i) => (
              <AllArtistsCard
                key={i}
                artistIndex={i}
                contractAddress={params.contractAddress}
              />
            ))}
          </div>
        </div>
      )}


      <div className="contract-info-box">
        <p className="contract-info-label">
          Smart contract address:
        </p>
        <a
          href={`https://blockscout-passet-hub.parity-testnet.parity.io/address/${params.contractAddress}`}
          target="_blank"
          rel="noopener noreferrer">
          {params.contractAddress} 🔗
        </a>
        <p className="contract-info-label">
          Contract Balance:
        </p>
        <p className="contract-balance-text">
          {contractBalance ? `${Number(contractBalance) / 1e18} PAS` : "0 PAS"}
        </p>
      </div>


      {/* Donation Form */}
      <div className="contract-form-section">
        <h3 className="contract-form-title">
          🎵 Donate to Artist
        </h3>

        <form onSubmit={handleDonation}>
          <div className="form-group">
            <label className="form-label">
              Artist Music ID
            </label>
            <input
              type="text"
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              placeholder="Enter artist music ID..."
              disabled={isSubmitting || isWritePending || isConfirming}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Donation Amount
            </label>
            <div className="amount-selector-group">
              {[1, 2, 10].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setDonationAmount(amount.toString())}
                  disabled={isSubmitting || isWritePending || isConfirming}
                  className={`btn-amount-selector ${donationAmount === amount.toString() ? 'active' : ''}`}
                >
                  {amount} PAS
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!artistId.trim() || !donationAmount.trim() || isSubmitting || isWritePending || isConfirming}
            className="btn-success"
          >
            {isWritePending || isConfirming ? "Donating..." : "Donate"}
          </button>
        </form>

        {/* Transaction Status */}
        {hash && (
          <div className={`tx-status-box ${isConfirmed ? 'tx-status-success' : 'tx-status-pending'}`}>
            {isConfirming && <p className="p-text">⏳ Waiting for confirmation...</p>}
            {isConfirmed && (
              <p className="tx-status-text">
                ✅ Donation successful!
              </p>
            )}
            <p className="tx-hash">
              Tx: {hash}
            </p>
          </div>
        )}

        {/* Error Display */}
        {writeError && (
          <div className="error-box">
            ❌ Error: {writeError.message}
          </div>
        )}
      </div>


    </div>
  );
}

function AllArtistsCard({artistIndex, contractAddress}: { artistIndex: number; contractAddress: `0x${string}` }) {
  const {data: artistData, isLoading} = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "artists",
    args: [artistIndex],
  });

  if (isLoading) {
    return (
      <div className="artist-card">
        <p className="p-text">
          Loading artist #{artistIndex}...
        </p>
      </div>
    );
  }

  if (!artistData || !(artistData as any)[0]) {
    return (
      <div className="artist-card">
        <p className="p-text">
          No data found for artist #{artistIndex}
        </p>
      </div>
    );
  }

  const [musicId, balance, isClaimed] = artistData as [string, bigint, boolean];

  return (
    <div className="artist-card">
      <div className="artist-card-header">
        <div className="artist-card-content">
          <p className="artist-card-label">
            Artist #{artistIndex} - Music ID
          </p>
          <p className="artist-card-value">
            {musicId}
          </p>
        </div>
        {isClaimed && (
          <span className="badge-claimed">
            CLAIMED
          </span>
        )}
      </div>
      <div>
        <p className="artist-card-label">
          Balance
        </p>
        <p className="artist-card-balance">
          {Number(balance) / 1e18} PAS
        </p>
      </div>
    </div>
  );
}
