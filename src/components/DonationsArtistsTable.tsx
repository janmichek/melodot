import {useEffect, useMemo, useState} from "react"
import {usePublicClient} from "wagmi"
import type {Abi} from "viem"
import {BalanceLabel} from "@/components/ui/balance-label"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {useArtistNames} from "@/hooks/useArtistNames"
import {ExternalLink} from "lucide-react"
import {donateConfig} from "@/generated"
import {Spinner} from "@/components/ui/spinner"
import type {ArtistStats, DonationsArtistsTableProps} from "@types"

export function DonationsArtistsTable({
  donations,
  contractAddress,
}: DonationsArtistsTableProps) {
  const publicClient = usePublicClient()
  const [artistClaimStatus, setArtistClaimStatus] = useState<Record<string, boolean>>({})
  const [isLoadingClaimStatus, setIsLoadingClaimStatus] = useState(false)
  
  // Memoize artist stats to prevent unnecessary recalculations
  const artistStats = useMemo(() => {
    return donations.reduce(
      (acc: Record<string, ArtistStats>, donation) => {
        if (!acc[donation.artistId]) {
          acc[donation.artistId] = {
            artistId: donation.artistId,
            totalDonated: 0n,
            totalArtistReward: 0n,
            totalPlatformFee: 0n,
            transactionCount: 0,
          }
        }
        acc[donation.artistId].totalDonated += donation.donatedAmount
        acc[donation.artistId].totalArtistReward += donation.artistReward
        acc[donation.artistId].totalPlatformFee += donation.platformFee
        acc[donation.artistId].transactionCount += 1
        return acc
      },
      {} as Record<string, ArtistStats>
    )
  }, [donations])

  const artistStatsArray = useMemo(() => Object.values(artistStats) as ArtistStats[], [artistStats])
  const artistIds = useMemo(() => artistStatsArray.map((stat: ArtistStats) => stat.artistId), [artistStatsArray])
  const {artistNames, isLoading: isLoadingNames} = useArtistNames(artistIds)

  // Memoize artistIds string for dependency array
  const artistIdsKey = useMemo(() => artistIds.join(","), [artistIds])

  // Fetch claim status for all artists
  useEffect(() => {
    const fetchClaimStatus = async () => {
      if (!publicClient || !contractAddress || artistIds.length === 0) {
        return
      }

      setIsLoadingClaimStatus(true)
      try {
        const claimStatusPromises = artistIds.map((artistId) =>
          publicClient.readContract({
            address: contractAddress,
            abi: donateConfig.abi as Abi,
            functionName: "getArtistInfo",
            args: [artistId],
          })
        )

        const results = await Promise.all(claimStatusPromises)
        const statusMap: Record<string, boolean> = {}

        artistIds.forEach((artistId, index) => {
          const [, isClaimed] = results[index] as [bigint, boolean]
          statusMap[artistId] = isClaimed
        })

        setArtistClaimStatus(statusMap)
      } catch (error) {
        console.error("Error fetching artist claim status:", error)
      } finally {
        setIsLoadingClaimStatus(false)
      }
    }

    fetchClaimStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, contractAddress, artistIdsKey])

  if (artistStatsArray.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Artist Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Transactions</TableHead>
            <TableHead>Donated</TableHead>
            <TableHead>Artist Reward</TableHead>
            <TableHead>Platform Fee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artistStatsArray.map((stat: ArtistStats) => {
            const artistInfo = artistNames[stat.artistId]
            return (
              <TableRow key={stat.artistId}>
                <TableCell>
                  {isLoadingNames ? (
                    <div className="flex items-center gap-1.5">
                      <Spinner size="sm" />
                    </div>
                  ) : artistInfo ? (
                    <a
                      href={artistInfo.external_urls?.spotify || `https://open.spotify.com/artist/${stat.artistId}`}
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
                  {isLoadingClaimStatus ? (
                    <div className="flex items-center gap-1.5">
                      <Spinner size="sm" />
                    </div>
                  ) : (
                    <span
                      className={
                        artistClaimStatus[stat.artistId]
                          ? "rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-500"
                          : "rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600"
                      }>
                      {artistClaimStatus[stat.artistId] ? "Claimed" : "Available"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {stat.transactionCount}
                  </span>
                </TableCell>
                <TableCell>
                  <BalanceLabel
                    balance={stat.totalDonated}
                    showSymbol={true}
                    size="small"/>
                </TableCell>
                <TableCell>
                  <BalanceLabel
                    balance={stat.totalArtistReward}
                    showSymbol={true}
                    size="small"/>
                </TableCell>
                <TableCell>
                  <BalanceLabel
                    balance={stat.totalPlatformFee}
                    showSymbol={true}
                    size="small"/>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
