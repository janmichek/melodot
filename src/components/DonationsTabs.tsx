import {DonationsTransactionsTable} from "@/components/DonationsTransactionsTable"
import {DonationsArtistsTable} from "@/components/DonationsArtistsTable"
import {DonationsDonorsTable} from "@/components/DonationsDonorsTable"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {AlertCircle, Info} from "lucide-react"
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext"
import type {DonationTransaction, DonationTransactionsProps} from "@types"

export function DonationsTabs({
  artistId,
  donations,
  error,
}: DonationTransactionsProps & {
  donations: DonationTransaction[]
  error: Error | null
}) {
  const {contractAddress} = useWeb3AuthContext()

  // Filter by artistId if provided
  const filteredDonations = artistId
    ? donations.filter((d) => d.artistId === artistId)
    : donations

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading donations: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (filteredDonations.length === 0) {
    return (
      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertDescription>
          No donation transactions found
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Tabs defaultValue="transactions" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="artists">Artists</TabsTrigger>
        <TabsTrigger value="donors">Donors</TabsTrigger>
      </TabsList>
      <TabsContent value="transactions" className="mt-4">
        <DonationsTransactionsTable
          donations={filteredDonations}
          artistId={artistId}/>
      </TabsContent>
      <TabsContent value="artists" className="mt-4">
        <DonationsArtistsTable 
          donations={filteredDonations} 
          contractAddress={contractAddress}/>
      </TabsContent>
      <TabsContent value="donors" className="mt-4">
        <DonationsDonorsTable 
          donations={filteredDonations}/>
      </TabsContent>
    </Tabs>
  )
}

