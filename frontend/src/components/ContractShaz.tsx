import {donateConfig} from "../generated";
import {useReadContract} from "wagmi";
import type {Abi} from "viem";
import {ArtistsList} from "./ArtistsList";
import {DonationForm} from "./DonationForm";

interface ContractShazProps {
  contractAddress: `0x${string}`;
}

export function ContractShaz({ contractAddress }: ContractShazProps) {
  const { refetch } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "balance",
  });

  const { data: count, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "getArtistsCount",
  });


  if (error) {
    return (
      <div data-testid="contract-error">
        <p className="error">
          Error loading contract at{" "}
          <span className="font-bold">{contractAddress}</span>
        </p>
        <code className="code-pre-wrap">{error.message}</code>
      </div>
    );
  }


  if (isLoading) {
    return (
      <p>
        Loading contract data for{" "}
        <span className="font-bold">{contractAddress}</span>...
      </p>
    );
  }

  return (
    <div data-testid="contract-data" className="max-w-600">

      <DonationForm
        contractAddress={contractAddress}
        artistId="test-artist-123"
        onSuccess={() => refetch()}
      />
a
      {count && Number(count) > 0 ? (
        <ArtistsList count={count as bigint} contractAddress={contractAddress} />
      ) : null}
bb
    </div>
  );
}
