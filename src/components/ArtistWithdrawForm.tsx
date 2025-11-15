import {useEffect, useState} from "react";
import {useAccount, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "@/generated";
import {AddressInput} from "@/components/ui/address-input";
import {TxNotification} from "@/components/ui/tx-notification";
import type {Abi} from "viem";
import {isAddress} from "viem";
import {Button} from "@/components/ui/button";

interface ArtistWithdrawFormProps {
  contractAddress: `0x${string}`;
  artistId: string;
  onWithdrawSuccess?: () => void;
}

export function ArtistWithdrawForm({
  contractAddress,
  artistId,
  onWithdrawSuccess,
}: ArtistWithdrawFormProps) {
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();
  const { isConnected } = useAccount();

  const {
    writeContract,
    isPending: isWithdrawPending,
    data: withdrawHash,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });

  const handleWithdraw = async () => {
    if (!artistId) {
      setWithdrawError('Please select an artist first');
      return;
    }

    if (!withdrawAddress || !isAddress(withdrawAddress as `0x${string}`)) {
      setWithdrawError('Invalid recipient address');
      return;
    }

    if (!contractAddress) {
      setWithdrawError('Contract address not found');
      return;
    }

    setWithdrawError(null);
    setTxHash(undefined);

    try {
      writeContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: 'withdrawDonates',
        args: [artistId, withdrawAddress as `0x${string}`],
      });
    } catch (error: any) {
      const errorMessage = error?.details?.errors?.[0]?.message ||
                          error?.shortMessage ||
                          error?.message ||
                          'Failed to withdraw';
      setWithdrawError(errorMessage);
      console.error('Withdraw error:', error);
    }
  };

  // Track the hash when the write transaction completes
  useEffect(() => {
    if (withdrawHash) {
      setTxHash(withdrawHash);
    }
  }, [withdrawHash]);

  // Handle successful confirmation
  useEffect(() => {
    if (isConfirmed) {
      onWithdrawSuccess?.();
    }
  }, [isConfirmed, onWithdrawSuccess]);

  // Handle errors
  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError?.message || 'Failed to initiate withdrawal';
      setWithdrawError(errorMessage);
      console.error('Write error:', writeError);
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      const errorMessage = confirmError?.message || 'Transaction failed to confirm';
      setWithdrawError(errorMessage);
      console.error('Confirm error:', confirmError);
    }
  }, [confirmError]);

  return (
    <div className="mt-6 space-y-4 rounded-lg border border-border bg-muted/5 p-4">
      <div className="space-y-4">
        <AddressInput
          value={withdrawAddress}
          onChange={setWithdrawAddress}
          placeholder="Enter recipient address (0x...)"
          label="Recipient Address"
          error={withdrawError}
          disabled={!isConnected || isWithdrawPending || isConfirming}
          showValidation={true}
        />
        <Button
          onClick={handleWithdraw}
          disabled={!isConnected || !isAddress(withdrawAddress as `0x${string}`) || isWithdrawPending || isConfirming}
          className="w-full sm:w-auto"
        >
          {isWithdrawPending
            ? "Sending transaction..."
            : isConfirming
            ? "Confirming..."
            : "Withdraw All"}
        </Button>

        <TxNotification
          hash={txHash}
          isLoading={isConfirming}
          isSuccess={isConfirmed}
          isError={!!writeError || !!confirmError}
          error={writeError?.message || confirmError?.message}
          title="Withdrawal Status"
          successMessage="✅ Funds withdrawn to your address!"
          pendingMessage="⏳ Processing withdrawal..."
          errorMessage="❌ Withdrawal failed"
          autoHideSuccess={false}
          onDismiss={() => {
            if (isConfirmed) {
              setWithdrawAddress('');
              setTxHash(undefined);
              setWithdrawError(null);
            }
          }}
        />
      </div>
    </div>
  );
}
