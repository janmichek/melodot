import {useAccount, useReadContract} from "wagmi"
import {isAddress} from "viem"
import {useWeb3AuthContext} from "@/entities/contract"
import {OwnerWithdrawForm} from "@/features/owner-withdraw"
import {donateConfig} from "@/shared/config"
import {PageHeader} from "@/shared/ui/page-header"

import {usePageMeta} from "@/shared/lib/seo"

export function Owner() {
  usePageMeta({
    title: "Owner dashboard — Donalyze",
    description: "Withdraw platform fees collected by the Donalyze donation contract.",
    path: "/owner",
  })
  const {contractAddress} = useWeb3AuthContext()
  const {address: connectedAddress} = useAccount()

  const isValidContractAddress =
    typeof contractAddress === 'string' && isAddress(contractAddress)

  const {data: ownerAddress, isLoading: isLoadingOwner} = useReadContract({
    address: isValidContractAddress ? contractAddress : undefined,
    abi: donateConfig.abi,
    functionName: "owner",
    query: {enabled: isValidContractAddress},
  })

  const {data: platformFeeBalance, isLoading: isLoadingFeeBalance, refetch: refetchPlatformFeeBalance} =
    useReadContract({
      address: isValidContractAddress ? contractAddress : undefined,
      abi: donateConfig.abi,
      functionName: "getPlatformFeeBalance",
      query: {enabled: isValidContractAddress},
    })

  const handleWithdrawalSuccess = () => {
    void refetchPlatformFeeBalance()
  }

  const ownerWalletAddress =
    typeof ownerAddress === 'string' && isAddress(ownerAddress)
      ? ownerAddress
      : undefined

  const isOwner =
    !!ownerWalletAddress &&
    !!connectedAddress &&
    connectedAddress.toLowerCase() === ownerWalletAddress.toLowerCase()

  return (
    <section className="space-y-6 pb-6">
      <PageHeader
        title="Owner"
        description="Withdraw platform fees collected from every donation. Only the contract owner can perform this action."/>

      {isOwner && ownerWalletAddress && !isLoadingOwner && !isLoadingFeeBalance ? (
        <OwnerWithdrawForm
          contractAddress={contractAddress}
          ownerAddress={ownerWalletAddress}
          platformFeeBalance={typeof platformFeeBalance === 'bigint' ? platformFeeBalance : 0n}
          onSuccess={handleWithdrawalSuccess}/>
      ) : (
        <div className="rounded-lg border border-border/50 bg-muted/20 p-6 text-center text-muted-foreground">
          {isLoadingOwner || isLoadingFeeBalance
            ? "Loading..."
            : !isOwner
              ? "You must be the contract owner to access this page."
              : "Unable to load owner information."}
        </div>
      )}
    </section>
  )
}
