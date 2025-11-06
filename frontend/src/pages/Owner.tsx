import { useReadContract, useAccount } from "wagmi";
import { Layout, useWeb3AuthContext } from "../components/Layout";
import { OwnerWithdrawForm } from "../components/OwnerWithdrawForm";
import { donateConfig } from "../generated";
import type { Abi } from "viem";

export function Owner() {
  const { contractAddress, isConnected } = useWeb3AuthContext();
  const { address } = useAccount();

  // Read contract owner
  const { data: owner } = useReadContract({
    address: contractAddress as `0x${string}` ,
    abi: donateConfig.abi as Abi,
    functionName: "owner",
    query: { enabled: !!contractAddress }
  });

  // Read total platform fee accumulated (1% of all donations)
  const { data: platformFeeBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: donateConfig.abi as Abi,
    functionName: "getPlatformFeeBalance",
    query: { enabled: !!contractAddress }
  });

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  return (
    <Layout>
      {isConnected && isOwner && contractAddress && address ? (
        <OwnerWithdrawForm
          contractAddress={contractAddress}
          ownerAddress={address as `0x${string}`}
          platformFeeBalance={platformFeeBalance as bigint | undefined}
        />
      ) : null}
    </Layout>
  );
}