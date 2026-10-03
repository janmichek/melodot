import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext"
import {ClaimCard} from "@/components/ClaimCard"
import {PageHeader} from "@/components/ui/page-header"
import {Button} from "@/components/ui/button"
import {Spinner} from "@/components/ui/spinner"

export function Claim() {
  const {contractAddress, isConnected, connect, connecting, providerReady} = useWeb3AuthContext()

  return (
    <section className="space-y-6 pb-6">
      <PageHeader
        title="Payout"
        description={
          !isConnected
            ? "Please sign in to claim."
            : "Claim your artist identity to pay donations out."
        }/>
      {!isConnected ? (
        connecting || !providerReady ? (
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
