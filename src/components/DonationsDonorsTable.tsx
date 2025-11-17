import {useMemo} from "react"
import {EXPLORER_BASE_URL, formatAddress} from "@/wagmi-config"
import {BalanceLabel} from "@/components/ui/balance-label"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import type {DonationsDonorsTableProps, DonorStats} from "@types"

export function DonationsDonorsTable({donations}: DonationsDonorsTableProps) {
  // Group donations by donor and calculate totals - memoized for performance
  const donors = useMemo(() => {
    const donorStats: Record<string, DonorStats> = {}

    for (const donation of donations) {
      if (!donorStats[donation.donor]) {
        donorStats[donation.donor] = {
          donor: donation.donor,
          totalDonated: 0n,
          transactionCount: 0,
        }
      }
      donorStats[donation.donor].totalDonated += donation.donatedAmount
      donorStats[donation.donor].transactionCount += 1
    }

    // Sort by total donated (descending)
    return Object.values(donorStats).sort((a, b) => {
      if (a.totalDonated > b.totalDonated) {return -1}
      if (a.totalDonated < b.totalDonated) {return 1}
      return 0
    })
  }, [donations])

  if (donors.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Donor</TableHead>
            <TableHead>Donated</TableHead>
            <TableHead>Transactions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donors.map((donor: DonorStats, index: number) => (
            <TableRow key={donor.donor}>
              <TableCell>
                <span className="text-sm font-semibold text-foreground">
                  #{index + 1}
                </span>
              </TableCell>
              <TableCell>
                <a
                  href={`${EXPLORER_BASE_URL}/address/${donor.donor}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-foreground hover:underline">
                  {formatAddress(donor.donor)}
                </a>
              </TableCell>
              <TableCell>
                <BalanceLabel
                  balance={donor.totalDonated}
                  showSymbol={true}
                  size="small"/>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {donor.transactionCount}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
