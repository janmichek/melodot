import {useEffect, useState} from "react";
import {useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "../generated";
import {CURRENCY_SYMBOL} from "../wagmi-config";
import {TxNotification} from "./ui/tx-notification";
import {Button} from "@/components/ui/button";
import type {Abi} from "viem";
import {parseEther} from "viem";
import {useWeb3AuthContext} from "../App";

interface DonationFormProps {
  artistId: string;
  onSuccess?: () => void;
}

export function DonationForm({ artistId, onSuccess }: DonationFormProps) {
  const [isDonating, setIsDonating] = useState(false);
  const { isConnected, connect, contractAddress } = useWeb3AuthContext();

  const {
    data: hash,
    writeContract,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({hash,});

  // Call onSuccess callback when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      onSuccess?.();
    }
  }, [isConfirmed, onSuccess]);

  const donate = async (amount: number) => {
     if (!isConnected) {
      void connect();
      return;
    }

    if (isDonating || isWriting || isConfirming) return;

    try {
      setIsDonating(true);
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: "donateToArtist",
        args: [artistId],
        value: parseEther(amount.toString()),
        // gas: BigInt(300000), // Fixed gas limit to avoid gas estimation issues
      });
    } catch (err) {
      console.error("Error donating:", err);
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Artist ID: {artistId}</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 10].map((amount) => (
            <Button
              key={amount}
              type="button"
              onClick={() => donate(amount)}
              disabled={isDonating || isWriting || isConfirming}
              variant="outline"
            >
              {`${amount} ${CURRENCY_SYMBOL}`}
            </Button>
          ))}
        </div>
      </div>

      <TxNotification
        hash={hash}
        isLoading={isConfirming}
        isSuccess={isConfirmed}
        isError={!!writeError}
        error={writeError?.message}
        title="Donation Status"
        successMessage="✅ Donation confirmed on-chain!"
        pendingMessage="⏳ Processing donation..."
        errorMessage="❌ Donation failed"
        autoHideSuccess={false}
      />
    </div>
  );
}
