import {useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "../generated";
import {formatAddressShort} from "../wagmi-config";
import {BalanceDisplay} from "./ui/balance-display";
import {TxNotification} from "./ui/tx-notification";
import type {Abi} from "viem";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";

interface OwnerWithdrawFormProps {
  contractAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  platformFeeBalance: bigint;
}

export function OwnerWithdrawForm({
  contractAddress,
  ownerAddress,
  platformFeeBalance,
}: OwnerWithdrawFormProps) {
  const {
    data: hash,
    writeContract,
    isPending: isWithdrawing,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash });

  const withdrawPlatformFees = async () => {
    if (isWithdrawing || isConfirming) return;

    try {
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "withdrawPlatformFees",
        args: [ownerAddress],
      });
    } catch (err) {
      console.error("Error withdrawing platform fees:", err);
    }
  };

  return (
    <Card className="owner-card">
      <h3 className="owner-card-title">💰 Platform Fee Withdrawal</h3>
      <p className="owner-card-subtitle">1% fee from all donations</p>

      <div className="owner-info-box">
        <div className="owner-info-row">
          <span className="owner-label">Available Balance:</span>
          <BalanceDisplay
            balance={platformFeeBalance}
            showSymbol={true}
            size="small"
          />
        </div>
        <div className="owner-info-row">
          <span className="owner-label">Recipient Address:</span>
          <span className="owner-value">{formatAddressShort(ownerAddress, 16)}</span>
        </div>
      </div>
      <Button
        onClick={withdrawPlatformFees}
        disabled={isWithdrawing || isConfirming || platformFeeBalance === 0n}
        className="owner-withdraw-btn"
      >
        {isWithdrawing || isConfirming ? "Processing..." : "Withdraw Platform Fees"}
      </Button>

      <TxNotification
        hash={hash}
        isLoading={isConfirming}
        isSuccess={isConfirmed}
        isError={!!writeError}
        error={writeError?.message}
        title="Withdrawal Status"
        successMessage="✅ Platform fees withdrawn!"
        pendingMessage="⏳ Processing withdrawal..."
        errorMessage="❌ Withdrawal failed"
        autoHideSuccess={false}
      />
    </Card>
  );
}
