import {useAccount, useReadContract} from "wagmi"
import type {Abi} from "viem"
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext"
import {OwnerWithdrawForm} from "@/components/OwnerWithdrawForm"
import {donateConfig} from "@/generated"
import {PageHeader} from "@/components/ui/page-header"

export function Owner() {
  const {contractAddress} = useWeb3AuthContext()
  const {address: connectedAddress} = useAccount()

  const {data: ownerAddress, isLoading: isLoadingOwner} = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: donateConfig.abi as Abi,
    functionName: "owner",
  })

  const {data: platformFeeBalance, isLoading: isLoadingFeeBalance, refetch: refetchPlatformFeeBalance} =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: donateConfig.abi as Abi,
      functionName: "getPlatformFeeBalance",
    })

  const handleWithdrawalSuccess = () => {
    void refetchPlatformFeeBalance()
  }

  const ownerWalletAddress = ownerAddress as `0x${string}` | undefined

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
          platformFeeBalance={(platformFeeBalance as bigint) ?? 0n}
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
