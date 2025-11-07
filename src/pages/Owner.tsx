import {useAccount, useReadContract} from "wagmi";
import {useWeb3AuthContext} from "../App";
import {OwnerWithdrawForm} from "../components/OwnerWithdrawForm";
import {donateConfig} from "../generated";
import type {Abi} from "viem";

export function Owner() {
  const { contractAddress, isConnected } = useWeb3AuthContext();
  const { address : connectedAddress } = useAccount();

  // Read contract owner
  const { data: ownerAddress } = useReadContract({
    address: contractAddress as `0x${string}` ,
    abi: donateConfig.abi as Abi,
    functionName: "owner",
  });

  // Read total platform fee accumulated (1% of all donations)
  const { data: platformFeeBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: donateConfig.abi as Abi,
    functionName: "getPlatformFeeBalance",
  });

  const isOwner =  ownerAddress && connectedAddress === ownerAddress;

  return (
    <>
      {isOwner ? (
        <OwnerWithdrawForm
          contractAddress={contractAddress}
          ownerAddress={ownerAddress as `0x${string}`}
          platformFeeBalance={platformFeeBalance as bigint}
        />
      ) : null}
    </>
  );
}
