import {donateConfig} from "../generated";
import {useReadContract} from "wagmi";
import type {Abi} from "viem";
import {ArtistsList} from "./ArtistsList";
import {DonationForm} from "./DonationForm";

export function ContractShaz(params: {
  contractAddress: `0x${string}`;
  userAddresses?: readonly `0x${string}`[];
}) {
  const { refetch } = useReadContract({
    address: params.contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "balance",
  });

  const { data: count, isLoading, error } = useReadContract({
    address: params.contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "getArtistsCount",
  });


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
      {count && Number(count) > 0 ? (
        <ArtistsList count={count as bigint} contractAddress={params.contractAddress} />
      ) : null}

      <DonationForm
        contractAddress={params.contractAddress}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
