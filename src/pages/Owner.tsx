import {useEffect, useState} from "react";
import {useAccount, useReadContract} from "wagmi";
import type {Abi} from "viem";
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext";
import {OwnerWithdrawForm} from "@/components/OwnerWithdrawForm";
import {ContractDashboard} from "@/components/ContractDashboard";
import {donateConfig} from "@/generated";
import {BalanceDisplay} from "@/components/ui/balance-display";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {formatAddressShort} from "@/wagmi-config";

export function Owner() {
  const {
    contractAddress,
    isConnected,
    connect,
    connecting,
    providerReady,
  } = useWeb3AuthContext();
  const { address: connectedAddress } = useAccount();
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  const { data: ownerAddress, isLoading: isLoadingOwner } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: donateConfig.abi as Abi,
    functionName: "owner",
  });

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

  const ownerWalletAddress = ownerAddress as `0x${string}` | undefined;

  const isOwner =
    !!ownerWalletAddress &&
    !!connectedAddress &&
    connectedAddress.toLowerCase() === ownerWalletAddress.toLowerCase();

  useEffect(() => {
    if (!isOwner && showWithdrawForm) {
      setShowWithdrawForm(false);
    }
  }, [isOwner, showWithdrawForm]);

  const adminButtonLabel = (() => {
    if (!isConnected) {
      return connecting ? "Connecting..." : "Sign In";
    }
    if (isOwner) {
      return showWithdrawForm ? "Hide Withdrawal Form" : "Withdraw Platform Fees";
    }
    return "Owner Access Required";
  })();

  const adminButtonDisabled =
    (!isConnected && (connecting || !providerReady)) ||
    (isConnected && !isOwner);

  const handleAdminButtonClick = () => {
    if (!isConnected) {
      connect?.();
      return;
    }
    if (!isOwner) {
      return;
    }
    setShowWithdrawForm((prev) => !prev);
  };

  return (
    <section className="space-y-6 pb-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Owner Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor contract health and manage platform fees for BeatChain.
        </p>
      </header>

      <ContractDashboard />

      <Card className="border border-primary/20 bg-primary/5 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">Admin Access</CardTitle>
          <CardDescription>
            Withdraw platform fees collected from every donation. Only the
            contract owner can perform this action.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="space-y-1">
            <span className="font-medium text-foreground">Owner Wallet</span>
            <div className="flex items-center rounded-md border border-border/50 bg-background/60 px-2 py-1 font-mono text-sm text-foreground">
              {isLoadingOwner || !ownerWalletAddress
                ? "—"
                : formatAddressShort(ownerWalletAddress, 16)}
            </div>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-foreground">
              Total Donated
            </span>
            <BalanceDisplay
              balance={(totalBalance as bigint) ?? 0n}
              showSymbol
              isLoading={isLoadingTotalBalance}
              size="medium"
              className="border-none bg-transparent p-0"
            />
          </div>
          <div className="space-y-1">
            <span className="font-medium text-foreground">
              Platform Fee Balance Ready
            </span>
            <BalanceDisplay
              balance={(platformFeeBalance as bigint) ?? 0n}
              showSymbol
              isLoading={isLoadingFeeBalance}
              size="medium"
              className="border-none bg-transparent p-0"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            onClick={handleAdminButtonClick}
            disabled={adminButtonDisabled}
            className="w-full sm:w-auto"
          >
            {adminButtonLabel}
          </Button>
          {/*todo simplify conditions*/}
          <span className="text-xs text-muted-foreground">
            {!isConnected
              ? "Sign in with the contract owner wallet to unlock admin actions."
              : isOwner
                ? "Keep the form open to submit a withdrawal transaction."
                : "You must switch to the contract owner wallet to manage fees."}
          </span>
        </CardFooter>
      </Card>

      {isOwner && showWithdrawForm && ownerWalletAddress && (
        <OwnerWithdrawForm
          contractAddress={contractAddress}
          ownerAddress={ownerWalletAddress}
          platformFeeBalance={(platformFeeBalance as bigint) ?? 0n}
        />
      )}
    </section>
  );
}
