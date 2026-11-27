import {useWeb3AuthContext} from "@/entities/contract"
import {ClaimCard} from "@/features/claim"
import {PageHeader} from "@/shared/ui/page-header"
import {Button} from "@/shared/ui/button"
import {Spinner} from "@/shared/ui/spinner"

import {usePageMeta} from "@/shared/lib/seo"

export function Claim() {
  usePageMeta({
    title: "Claim your artist payouts — Donalyze",
    description: "Verify your Spotify artist profile and withdraw listener tips from the Donate contract.",
    path: "/claim",
  })
  const {contractAddress, isConnected, connect, connecting} = useWeb3AuthContext()

  return (
    <section className="space-y-6 pb-6">
      <PageHeader
        title="Claim Artist Payout"
        description={
          !isConnected
            ? "Please sign in to claim."
            : "Claim your artist identity to pay donations out."
        }/>
      {!isConnected ? (
        connecting ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" />
          </div>
        ) : (
          <Button
            onClick={() => connect?.()}
            size="lg"
            className="w-full sm:w-auto">
            Sign In
          </Button>
        )
      ) : (
        <ClaimCard contractAddress={contractAddress} />
      )}
    </section>
  )
}
