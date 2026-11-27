import {DonationsTabs} from "@/widgets/donations"
import {PageHeader} from "@/shared/ui/page-header"
import {Spinner} from "@/shared/ui/spinner"
import {useDonationTransactions} from "@/entities/donation"
import {useWeb3AuthContext} from "@/entities/contract"

import {usePageMeta} from "@/shared/lib/seo"

export function Donations() {
  usePageMeta({
    title: "Donation history — Donalyze",
    description: "Every on-chain tip sent through Donalyze, grouped by artist, donor, and transaction.",
    path: "/donations",
  })
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
          className="flex flex-col gap-4 border border-border/70 bg-transparent p-0 text-sm text-muted-foreground"
          data-testid="donations-list">
          <DonationsTabs donations={donations} error={error} />
        </section>
      )}
    </section>
  )
}



