import {useEffect, useState} from "react";
import {useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "../generated";
import {CURRENCY_SYMBOL} from "../wagmi-config";
import {TxNotification} from "./ui/tx-notification";
import {Button} from "@/components/ui/button";
import type {Abi} from "viem";
import {parseEther} from "viem";
import {useWeb3AuthContext} from "../App";
import {useQueryClient} from "@tanstack/react-query";

interface DonationFormProps {
  artistId: string;
  onSuccess?: () => void;
}

export function DonationForm({ artistId, onSuccess }: DonationFormProps) {
  const [isDonating, setIsDonating] = useState(false);
  const { isConnected, connect, contractAddress, address } = useWeb3AuthContext();
  const queryClient = useQueryClient();

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

  // Helper function to invalidate balance queries
  const invalidateBalance = (userAddress: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        if (!Array.isArray(queryKey) || queryKey[0] !== 'balance') {
          return false;
        }
        const params = queryKey[1];
        if (typeof params !== 'object' || params === null || !('address' in params)) {
          return false;
        }
        const queryAddress = params.address;
        return (
          typeof queryAddress === 'string' &&
          queryAddress.toLowerCase() === userAddress.toLowerCase()
        );
      },
    });
  };

  // Call onSuccess callback and refetch balance when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && address) {
      invalidateBalance(address);
      onSuccess?.();
    }
  }, [isConfirmed, onSuccess, queryClient, address]);

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
      });
    } catch (err) {
      console.error("Error donating:", err);
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {[1, 2, 10, 50, 100].map((amount) => (
            <Button
              key={amount}
              type="button"
              onClick={() => donate(amount)}
              disabled={isDonating || isWriting || isConfirming}
              variant="outline"
              size="lg"
              className="min-w-[100px] font-semibold"
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
