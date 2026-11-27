import {useMemo} from "react"
import {useReadContract} from "wagmi"
import type {Abi} from "viem"
import {useQuery} from "@tanstack/react-query"
import {useWeb3AuthContext} from "@/entities/contract"
import {fetchDonationMadeLogs} from "@/entities/donation"
import {proxyPublicClient} from "@/shared/lib/rpcClient"
import {
  CURRENCY_SYMBOL,
  donateConfig,
  formatAddress,
  formatPasBalance,
  passetHub,
} from "@/shared/config"

export function StatisticsDashboard() {
  const {contractAddress} = useWeb3AuthContext()

  const {data: totalBalance} = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: donateConfig.abi as Abi,
    functionName: "totalBalance",
  })

  const {data: artistsCount, isLoading: isLoadingArtistsCount} = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: donateConfig.abi as Abi,
    functionName: "getArtistsCount",
  })

  const {data: platformFeeInfo, isLoading: isLoadingFeeInfo} = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: donateConfig.abi as Abi,
    functionName: "getPlatformFeeInfo",
  })

  const {data: donationLogs, isLoading: isLoadingLogs} = useQuery({
    queryKey: ["donationLogs", contractAddress],
    queryFn: async () => {
      if (!contractAddress) {return []}
      return fetchDonationMadeLogs(proxyPublicClient, contractAddress as `0x${string}`, {
        windowBlocks: 100_000n,
        chunkBlocks: 5_000n,
        expectedChainId: passetHub.id,
      })
    },
    enabled: !!contractAddress,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  const donationTotals = useMemo(() => {
    let donated = 0n
    let platformFees = 0n
    for (const log of donationLogs ?? []) {
      donated += log.args.donatedAmount ?? 0n
      platformFees += log.args.platformFee ?? 0n
    }
    return {donated, platformFees}
  }, [donationLogs])

  const donationCount = donationLogs?.length ?? 0
  const uniqueDonors = useMemo(
    () => new Set((donationLogs ?? []).map((log) => log.args.donor).filter(Boolean)).size,
    [donationLogs],
  )
  const averageDonation = donationCount > 0 ? donationTotals.donated / BigInt(donationCount) : 0n

  const feeTuple = platformFeeInfo as readonly [`0x${string}`, number | bigint] | undefined
  const feeRecipient = feeTuple?.[0]
  const feeBps = feeTuple?.[1] !== undefined ? Number(feeTuple[1]) : undefined
  const feePercent = feeBps !== undefined ? (feeBps / 100).toLocaleString(undefined, {maximumFractionDigits: 2}) : "—"

  const cells = [
    {
      label: "Donated / window",
      value: `${formatPasBalance(donationTotals.donated)} ${CURRENCY_SYMBOL}`,
      note: "Sum of DonationMade events in the last 100,000 blocks.",
    },
    {
      label: "Contract balance",
      value: `${formatPasBalance((totalBalance as bigint) ?? 0n)} ${CURRENCY_SYMBOL}`,
      note: "Funds still held by the contract, including unsettled fees.",
    },
    {
      label: "Artists",
      value: isLoadingArtistsCount ? "—" : String(Number((artistsCount as bigint) ?? 0n)),
      note: "Unique artist IDs that have received at least one donation.",
    },
    {
      label: "Donations",
      value: isLoadingLogs ? "—" : String(donationCount),
      note: "Transaction count in the recent window.",
    },
    {
      label: "Donors",
      value: isLoadingLogs ? "—" : String(uniqueDonors),
      note: "Unique wallets that donated in the recent window.",
    },
    {
      label: "Avg donation",
      value: `${formatPasBalance(averageDonation)} ${CURRENCY_SYMBOL}`,
      note: "Average donation in the recent window.",
    },
    {
      label: "Platform fees",
      value: `${formatPasBalance(donationTotals.platformFees)} ${CURRENCY_SYMBOL}`,
      note: `Accrued at ${isLoadingFeeInfo ? "—" : `${feePercent}%`} in the recent window.`,
    },
    {
      label: "Fee recipient",
      value: feeRecipient ? formatAddress(feeRecipient, 6, 4) : "—",
      note: "Configured owner address.",
      href: feeRecipient
        ? `${passetHub.blockExplorers.default.url}/address/${feeRecipient}`
        : undefined,
      mono: true,
    },
    {
      label: "Contract",
      value: contractAddress ? formatAddress(contractAddress, 6, 4) : "—",
      note: "Donate.sol on Polkadot Hub TestNet.",
      href: contractAddress
        ? `${passetHub.blockExplorers.default.url}/address/${contractAddress}`
        : undefined,
      mono: true,
    },
    {
      label: "Network",
      value: "420420417",
      note: `${passetHub.name} · PAS · testnet`,
    },
    {
      label: "Scan window",
      value: "100k",
      note: "Rolling block window for event totals.",
    },
    {
      label: "Explorer",
      value: "Blockscout",
      note: "Verify transactions and contract state.",
      href: passetHub.blockExplorers.default.url,
    },
  ]

  return (
    <div className="stat-ledger" data-testid="statistics-dashboard">
      {cells.map((cell) => (
        <div className="stat-cell" key={cell.label}>
          <p className="stat-cell__label">{cell.label}</p>
          <div>
            {cell.href ? (
              <a
                href={cell.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`stat-cell__value block hover:text-acid ${cell.mono ? "stat-cell__value--mono" : ""}`}>
                {cell.value}
              </a>
            ) : (
              <p className={`stat-cell__value ${cell.mono ? "stat-cell__value--mono" : ""}`}>
                {cell.value}
              </p>
            )}
            <p className="stat-cell__note mt-2">{cell.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
