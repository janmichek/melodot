import {DonationsTabs} from "@/components/DonationsTabs"
import {PageHeader} from "@/components/ui/page-header"
import {Spinner} from "@/components/ui/spinner"
import {useDonationTransactions} from "@/hooks/useDonationTransactions"
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext"

export function Donations() {
  const {contractAddress} = useWeb3AuthContext()
  const {donations, isLoading, error} = useDonationTransactions(contractAddress)

  return (
    <section className="space-y-6 pb-6">
      <PageHeader
        title="Donations"
        description="Smart contract activity overview"/>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <section
          className="flex flex-col gap-4 rounded-xl border border-border bg-muted/5 p-4 text-sm text-muted-foreground"
          data-testid="donations-list">
          <DonationsTabs donations={donations} error={error} />
        </section>
      )}
    </section>
  )
}



