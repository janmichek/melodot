import {useMemo} from "react"
import {EXPLORER_BASE_URL, formatAddress} from "@/wagmi-config"
import {BalanceLabel} from "@/components/ui/balance-label"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {ExternalLink} from "lucide-react"
import {useArtistNames} from "@/hooks/useArtistNames"
import {Spinner} from "@/components/ui/spinner"
import type {RecentDonationTransactionsProps} from "@types"

// Simple date formatter
const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000)
  if (seconds < 60) {return `${seconds}s ago`}
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {return `${minutes}m ago`}
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {return `${hours}h ago`}
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function DonationsTransactionsTable({
  donations,
  artistId: _artistId,
}: RecentDonationTransactionsProps) {
  // Memoize artist IDs to prevent unnecessary API calls
  const artistIds = useMemo(() => donations.map((d) => d.artistId), [donations])
  const {artistNames, isLoading: isLoadingNames} = useArtistNames(artistIds)

  return (
    <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Artist Name</TableHead>
              <TableHead>Donated</TableHead>
              <TableHead>Artist Reward</TableHead>
              <TableHead>Platform Fee</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation: import("@types").Donation) => {
              const artistInfo = artistNames[donation.artistId]
              return (
                <TableRow key={donation.txHash}>
                  <TableCell>
                    <a
                      href={`${EXPLORER_BASE_URL}/tx/${donation.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      {formatAddress(donation.txHash, 8, 6)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`${EXPLORER_BASE_URL}/address/${donation.donor}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-foreground hover:underline">
                      {formatAddress(donation.donor)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    {isLoadingNames ? (
                      <div className="flex items-center gap-1.5">
                        <Spinner size="sm" />
                      </div>
                    ) : artistInfo ? (
                      <a
                        href={artistInfo.external_urls?.spotify || `https://open.spotify.com/artist/${donation.artistId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary hover:underline">
                        {artistInfo.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <BalanceLabel
                      balance={donation.donatedAmount}
                      showSymbol={true}
                      size="small"/>
                  </TableCell>
                  <TableCell>
                    <BalanceLabel
                      balance={donation.artistReward}
                      showSymbol={true}
                      size="small"/>
                  </TableCell>
                  <TableCell>
                    <BalanceLabel
                      balance={donation.platformFee}
                      showSymbol={true}
                      size="small"/>
                  </TableCell>
                  <TableCell>
                    {donation.timestamp ? (
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(donation.timestamp)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
