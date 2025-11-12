// @ts-check

import {useAccount, useReadContract} from "wagmi";
import {useWeb3AuthContext} from "../App";
import {OwnerWithdrawForm} from "../components/OwnerWithdrawForm";
import {donateConfig} from "../generated";

export function Owner() {
  const { contractAddress } = useWeb3AuthContext();
  const { address: connectedAddress } = useAccount();

  if (!contractAddress) {
    return null;
  }

  const { data: ownerAddress } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi,
    functionName: "owner",
  });

  const { data: platformFeeBalance } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi,
    functionName: "getPlatformFeeBalance",
  });

  const ownerHex = typeof ownerAddress === "string" ? ownerAddress : undefined;
  const platformBalance = typeof platformFeeBalance === "bigint" ? platformFeeBalance : undefined;
  const isOwner = Boolean(ownerHex && connectedAddress && connectedAddress.toLowerCase() === ownerHex.toLowerCase());

  if (!isOwner || !ownerHex || platformBalance === undefined) {
    return null;
  }

  return (
    <OwnerWithdrawForm
      contractAddress={contractAddress}
      ownerAddress={ownerHex}
      platformFeeBalance={platformBalance}
    />
  );
}
