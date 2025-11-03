import { useState } from "react";
import { useBalance, useChainId } from "wagmi";
import { passetHub } from "../wagmi-config";
import { useWeb3AuthContext } from "./Layout";
import { UserMenu } from "./UserMenu";

export function Header() {
  const {
    isConnected,
    address,
    connect,
    disconnect,
    connectLoading,
    disconnectLoading,
    providerReady,
  } = useWeb3AuthContext();

  const [copied, setCopied] = useState(false);
  const chainId = useChainId();
  const { data: balance, isLoading } = useBalance({
    address: address,
    chainId: passetHub.id,
  });

  const getChainName = () => {
    if (chainId === passetHub.id) return "Passet Hub";
    if (chainId === 1) return "Ethereum";
    return "Unknown";
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address).catch(err => {
        console.error('Failed to copy address:', err);
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="dapp-header-subtle">
      <div className="header-content-subtle">
        {isConnected && address ? (
          <UserMenu
            onCopyAddress={handleCopyAddress}
            copied={copied}
          />
        ) : (
          <button
            onClick={() => connect()}
            className="header-connect-btn"
            disabled={connectLoading || !providerReady}>
            {connectLoading ? "•••" : "Connect"}
          </button>
        )}
      </div>
    </header>
  );
}
