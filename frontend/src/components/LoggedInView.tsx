import { Balance } from "./Balance";
import { ContractShaz } from "./ContractShaz";
import Shazam from "./Shazam";
import { WALLET_CONNECTOR_TYPE } from "@web3auth/modal/react";
import { useChainId, useReadContract } from "wagmi";
import { passetHub, kusamaAssetHub, westend } from "../wagmi-config";
import { donateConfig } from "../generated";
import type { Abi } from "viem";

interface LoggedInViewProps {
  connectorName: WALLET_CONNECTOR_TYPE | null;
  address: `0x${string}` | undefined;
  contractAddress: `0x${string}` | undefined;
  onDisconnect: () => void;
  disconnectLoading: boolean;
  disconnectError: Error | null;
  userInfo:   any;
}

export function LoggedInView({
  connectorName,
  address,
  contractAddress,
  onDisconnect,
  disconnectLoading,
  disconnectError,
                               userInfo,
}: LoggedInViewProps) {
  const chainId = useChainId();

  // Read contract balance
  const { data: contractBalance } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "balance",
  });

  const getFaucetUrl = (chainId: number, address: string) => {
    const faucetUrls = {
      [passetHub.id]: `https://faucet.polkadot.io/?parachain=1111&address=${address}`,
      [kusamaAssetHub.id]: `https://faucet.polkadot.io/?parachain=1000&address=${address}`,
      [westend.id]: `https://faucet.polkadot.io/?parachain=1000&address=${address}`,
    };
    return faucetUrls[chainId as keyof typeof faucetUrls];
  };

  const handleFaucetClick = () => {
    if (!address) return;
    const faucetUrl = getFaucetUrl(chainId, address);
    window.open(faucetUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="grid">
      <div className="showcase-message">
        <h3>
          🎯 Interact directly with Polkadot Asset Hub - no MetaMask required!
        </h3>
        <p>
          You're connected via Web3Auth. A secure key pair was generated from
          your social login choice, enabling blockchain interactions without
          browser wallet extensions.
        </p>
      </div>

      <Shazam />

      <h2>Connected to {connectorName}</h2>
      <div>Connected address: {address}</div>
      <div>   Name: {userInfo?.name}</div>
      <Balance />

      {contractAddress && (
        <div className="contract-info-box">
          <p className="contract-info-label">Smart contract address:</p>
          <a
            href={`https://blockscout-passet-hub.parity-testnet.parity.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contractAddress} 🔗
          </a>
          <p className="contract-info-label">Contract Balance:</p>
          <p className="contract-balance-text">
            {contractBalance ? `${Number(contractBalance) / 1e18} PAS` : "0 PAS"}
          </p>
        </div>
      )}

      <div className="flex-container">
        <div>
          <button onClick={handleFaucetClick} className="card faucet-button">
            Get Test Tokens
          </button>
        </div>
        <div>
          <button onClick={onDisconnect} className="card">
            Log Out
          </button>
          {disconnectLoading && <div className="loading">Disconnecting...</div>}
          {disconnectError && (
            <div className="error">{disconnectError.message}</div>
          )}
        </div>
      </div>

      {contractAddress && (
        <>
          <div className="contract-section">
            <h3>Message Contract Interactions</h3>
            <ContractShaz
              contractAddress={contractAddress}
              userAddresses={address ? [address] : undefined}
            />
          </div>
        </>
      )}
    </div>
  );
}
