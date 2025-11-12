// @ts-check

import {useEffect, useState} from "react";
import {useAccount, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {donateConfig} from "../generated";
import {AddressInput} from "./ui/address-input";
import {TxNotification} from "./ui/tx-notification";
import {isAddress} from "viem";
import {Button} from "@/components/ui/button";

/**
 * @param {{contractAddress: string, artistId: string, onWithdrawSuccess?: () => void}} props
 */
export function ArtistWithdrawForm({
  contractAddress,
  artistId,
  onWithdrawSuccess,
}) {
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawError, setWithdrawError] = useState(/** @type {string|null} */ (null));
  const [txHash, setTxHash] = useState(/** @type {string|undefined} */ (undefined));
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
  } = useWaitForTransactionReceipt({ hash: txHash });

  const handleWithdraw = async () => {
    if (!artistId) {
      setWithdrawError('Please select an artist first');
      return;
    }

    if (!withdrawAddress || !isAddress(withdrawAddress)) {
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
        abi: donateConfig.abi,
        functionName: 'withdrawDonates',
        args: [artistId, withdrawAddress],
      });
    } catch (error) {
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
      <div className="space-y-1">
        <h4 className="text-base font-semibold">Withdraw Claimed Balance</h4>
        <p className="text-sm text-muted-foreground">
          Send your claimed balance to a wallet address.
        </p>
      </div>
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
          disabled={!isConnected || !isAddress(withdrawAddress) || isWithdrawPending || isConfirming}
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
