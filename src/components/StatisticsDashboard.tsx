import {useMemo} from "react"
import {useBlockNumber, useReadContract} from "wagmi"
import type {Abi} from "viem"
import {formatEther} from "viem"
import {useQuery} from "@tanstack/react-query"
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext"
import {donateConfig} from "@/generated"
import {fetchDonationMadeLogs} from "@/lib/donationLogs"
import {proxyPublicClient} from "@/lib/rpcClient"
import {BalanceLabel} from "@/components/ui/balance-label"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {formatAddress, passetHub} from "@/wagmi-config"

export function StatisticsDashboard() {
  const {contractAddress} = useWeb3AuthContext()

  const {data: platformFeeBalance, isLoading: isLoadingFeeBalance} =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: donateConfig.abi as Abi,
      functionName: "getPlatformFeeBalance",
    })

  const {data: totalBalance, isLoading: isLoadingTotalBalance} =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: donateConfig.abi as Abi,
      functionName: "totalBalance",
    })

  const {data: artistsCount, isLoading: isLoadingArtistsCount} =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: donateConfig.abi as Abi,
      functionName: "getArtistsCount",
    })

  const {data: platformFeeInfo, isLoading: isLoadingFeeInfo} =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: donateConfig.abi as Abi,
      functionName: "getPlatformFeeInfo",
    })

  const {data: blockNumber} = useBlockNumber()

  const {data: donationLogs, isLoading: isLoadingLogs} = useQuery({
    queryKey: ["donationLogs", contractAddress, blockNumber?.toString()],
    queryFn: async () => {
      if (!contractAddress) {return []}
      // Bounded chunked scan via the RPC proxy — a single 0→latest
      // eth_getLogs is rejected by the RPC, and its host is unreachable
      // straight from browsers.
      return fetchDonationMadeLogs(proxyPublicClient, contractAddress as `0x${string}`, {
        windowBlocks: 100_000n,
        chunkBlocks: 5_000n,
        expectedChainId: passetHub.id,
      })
    },
    enabled: !!contractAddress,
    staleTime: 60_000,
  })

  const totalDonationsCount = donationLogs?.length ?? 0
  const uniqueDonorsCount = useMemo(() => {
    if (!donationLogs) {return 0}
    const donors = new Set(donationLogs.map((log) => log.args.donor))
    return donors.size
  }, [donationLogs])

  const averageDonation = useMemo(() => {
    if (!totalBalance || !totalDonationsCount || totalDonationsCount === 0) {return "0"}
    const avg = (totalBalance as bigint) / BigInt(totalDonationsCount)
    return Number(formatEther(avg)).toFixed(4)
  }, [totalBalance, totalDonationsCount])

  const platformFeeInfoTuple = platformFeeInfo as
    | readonly [`0x${string}`, number | bigint]
    | undefined

  const platformFeeRecipient = platformFeeInfoTuple?.[0]
  const platformFeeBpsRaw = platformFeeInfoTuple?.[1]
  const platformFeeBps =
    platformFeeBpsRaw !== undefined ? Number(platformFeeBpsRaw) : undefined

  const platformFeePercent = useMemo(() => {
    if (platformFeeBps === undefined) {return undefined}
    return (platformFeeBps / 100).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }, [platformFeeBps])

  const stats = [
    {
      key: "total-donated",
      node: (
        <Card
          key="total-donated"
          className="h-full border-0 bg-neutral-100 dark:bg-neutral-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total Donated
            </CardTitle>
            <CardDescription>
              Total amount donated to artists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceLabel
              balance={(totalBalance as bigint) ?? 0n}
              showSymbol
              isLoading={isLoadingTotalBalance}
              size="large"
              className="bg-transparent p-0"/>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "artists-count",
      node: (
        <Card
          key="artists-count"
          className="h-full border-0 bg-neutral-200/70 dark:bg-neutral-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Artists
            </CardTitle>
            <CardDescription>
              Unique artists with donations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4">
              <p className="text-2xl font-semibold text-foreground">
                {isLoadingArtistsCount
                  ? "—"
                  : Number((artistsCount as bigint) ?? 0n)}
              </p>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "total-donations",
      node: (
        <Card
          key="total-donations"
          className="h-full border-0 bg-neutral-200/70 dark:bg-neutral-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total Donations
            </CardTitle>
            <CardDescription>
              Number of donation transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4">
              <p className="text-2xl font-semibold text-foreground">
                {isLoadingLogs ? "—" : totalDonationsCount}
              </p>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "owner-address",
      node: (
        <Card
          key="owner-address"
          className="h-full border-0 bg-neutral-50 dark:bg-neutral-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Owner
            </CardTitle>
            <CardDescription>
              Creator and platform fee recipient.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFeeInfo || !platformFeeRecipient ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              <a
                href={`${passetHub.blockExplorers.default.url}/address/${platformFeeRecipient}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate rounded-md bg-muted/30 px-3 py-2 font-mono text-sm text-primary hover:underline">
                {formatAddress(platformFeeRecipient, 10, 8)}
              </a>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      key: "donors",
      node: (
        <Card
          key="donors"
          className="h-full border-0 bg-neutral-100 dark:bg-neutral-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Donors
            </CardTitle>
            <CardDescription>
              Unique wallet addresses that donated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4">
              <p className="text-2xl font-semibold text-foreground">
                {isLoadingLogs ? "—" : uniqueDonorsCount}
              </p>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "platform-fees",
      node: (
        <Card
          key="platform-fees"
          className="h-full border-0 bg-neutral-200/70 dark:bg-neutral-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Platform Fee Collected
            </CardTitle>
            <CardDescription>
              Fees collected at {isLoadingFeeInfo || platformFeePercent === undefined ? "—" : `${platformFeePercent}%`} rate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceLabel
              balance={(platformFeeBalance as bigint) ?? 0n}
              showSymbol
              isLoading={isLoadingFeeBalance}
              size="large"
              className="bg-transparent p-0"/>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "avg-donation",
      node: (
        <Card
          key="avg-donation"
          className="h-full border-0 bg-neutral-100 dark:bg-neutral-800/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Avg Donation
            </CardTitle>
            <CardDescription>
              Average amount per donation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceLabel
              balance={BigInt(Math.floor(Number(averageDonation) * 1e18))}
              showSymbol
              isLoading={isLoadingLogs || isLoadingTotalBalance}
              size="large"
              className="bg-transparent p-0"/>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "contract-address",
      node: (
        <Card
          key="contract-address"
          className="h-full border-0 bg-neutral-50 dark:bg-neutral-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contract Address
            </CardTitle>
            <CardDescription>
              Address of deployed contract.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contractAddress ? (
              <a
                href={`${passetHub.blockExplorers.default.url}/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate rounded-md bg-muted/30 px-3 py-2 font-mono text-sm text-primary hover:underline">
                {formatAddress(contractAddress, 10, 8)}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      key: "network",
      node: (
        <Card
          key="network"
          className="h-full border-0 bg-neutral-200/70 dark:bg-neutral-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Network
            </CardTitle>
            <CardDescription>
              Blockchain network for transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">
              {passetHub.name}
            </p>
          </CardContent>
        </Card>
      ),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.key}>{stat.node}</div>
      ))}
    </div>
  )
}

