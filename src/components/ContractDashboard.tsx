import {useMemo} from "react";
import {useReadContract} from "wagmi";
import type {Abi} from "viem";
import {useWeb3AuthContext} from "../App";
import {donateConfig} from "../generated";
import {BalanceDisplay} from "@/components/ui/balance-display";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formatAddress, formatAddressShort, passetHub} from "../wagmi-config";

export function ContractDashboard() {
  const {contractAddress} = useWeb3AuthContext();

  const { data: platformFeeBalance, isLoading: isLoadingFeeBalance } =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: donateConfig.abi as Abi,
      functionName: "getPlatformFeeBalance",
    });

  const { data: totalBalance, isLoading: isLoadingTotalBalance } =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: donateConfig.abi as Abi,
      functionName: "balance",
    });

  const { data: artistsCount, isLoading: isLoadingArtistsCount } =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: donateConfig.abi as Abi,
      functionName: "getArtistsCount",
    });

  const { data: platformFeeInfo, isLoading: isLoadingFeeInfo } =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: donateConfig.abi as Abi,
      functionName: "getPlatformFeeInfo",
    });

  const platformFeeInfoTuple = platformFeeInfo as
    | readonly [`0x${string}`, number | bigint]
    | undefined;

  const platformFeeRecipient = platformFeeInfoTuple?.[0];
  const platformFeeBpsRaw = platformFeeInfoTuple?.[1];
  const platformFeeBps =
    platformFeeBpsRaw !== undefined ? Number(platformFeeBpsRaw) : undefined;

  const platformFeePercent = useMemo(() => {
    if (platformFeeBps === undefined) return undefined;
    return (platformFeeBps / 100).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }, [platformFeeBps]);

  const stats = [
    {
      key: "total-donated",
      node: (
        <BalanceDisplay
          key="total-donated"
          label="Total Donated"
          balance={(totalBalance as bigint) ?? 0n}
          showSymbol
          isLoading={isLoadingTotalBalance}
          size="large"
          className="h-full"
        />
      ),
    },
    {
      key: "platform-fees",
      node: (
        <BalanceDisplay
          key="platform-fees"
          label="Platform Fee Balance"
          balance={(platformFeeBalance as bigint) ?? 0n}
          showSymbol
          isLoading={isLoadingFeeBalance}
          size="large"
          className="h-full"
        />
      ),
    },
    {
      key: "artists-tracked",
      node: (
        <Card
          key="artists-tracked"
          className="h-full border border-border/70 bg-card/40 backdrop-blur"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Artists Tracked
            </CardTitle>
            <CardDescription>
              Unique artist IDs with donations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {isLoadingArtistsCount
                ? "—"
                : Number((artistsCount as bigint) ?? 0n)}
            </p>
          </CardContent>
        </Card>
      ),
    },
    {
      key: "platform-fee-settings",
      node: (
        <Card
          key="platform-fee-settings"
          className="h-full border border-border/70 bg-card/40 backdrop-blur"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Platform Fee Settings
            </CardTitle>
            <CardDescription>
              Fee recipient and percentage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Recipient
              </span>
              <span className="flex items-center rounded-md bg-muted/30 px-2 py-1 font-mono text-sm">
                {isLoadingFeeInfo || !platformFeeRecipient
                  ? "—"
                  : formatAddressShort(platformFeeRecipient, 12)}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Fee Rate
              </span>
              <span className="text-lg font-semibold">
                {isLoadingFeeInfo || platformFeePercent === undefined
                  ? "—"
                  : `${platformFeePercent}%`}
              </span>
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/40 bg-muted/10 p-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{passetHub.name}</span>
        <span>•</span>
        {contractAddress && (
          <>
            <a
              href={`${passetHub.blockExplorers.default.url}/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              {formatAddress(contractAddress, 6, 4)}
            </a>
            <span>•</span>
          </>
        )}
        <span>
          {isLoadingArtistsCount
            ? "—"
            : `${Number((artistsCount as bigint) ?? 0n)} artists`}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.key}>{stat.node}</div>
        ))}
      </div>
    </div>
  );
}

