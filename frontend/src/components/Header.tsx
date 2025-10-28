import { useState } from "react";
import { useBalance, useChainId } from "wagmi";
import { passetHub, CURRENCY_SYMBOL } from "../wagmi-config";
import { formatUnits } from "viem";

interface HeaderProps {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  onConnect: () => void;
  onDisconnect: () => void;
  connectLoading: boolean;
  disconnectLoading: boolean;
  providerReady: boolean;
}

export function Header({
  isConnected,
  address,
  onConnect,
  onDisconnect,
  connectLoading,
  disconnectLoading,
  providerReady,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const chainId = useChainId();
  const { data: balance , isLoading} = useBalance({
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
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="dapp-header-subtle">
      <div className="header-content-subtle">
        {isConnected && address ? (
          <div className="header-info-compact">
            <div className="header-chain-badge">{getChainName()}</div>
            <div className="header-divider">|</div>
            <div className="header-balance">
              {/*todo balance is not formatted right*/}
              {balance?.value !== undefined
                ? `${formatUnits(balance.value, balance.decimals)} ${balance.symbol || CURRENCY_SYMBOL}`
                : '---'}
              {/*todo use isLoading instead*/}
            </div>
            <div className="header-divider">|</div>
            <a
              href="https://faucet.polkadot.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="header-faucet-link"
              title="Get test tokens">
              Faucet
            </a>
            <div className="header-divider">|</div>
            <div
              className={`header-address ${copied ? 'header-address-copied' : ''}`}
              onClick={handleCopyAddress}
              title={copied ? "Copied!" : "Click to copy address"}>
              {copied ? "✓ Copied!" : `${address.slice(0, 4)}...${address.slice(-3)}`}
            </div>
            <button
              onClick={onDisconnect}
              className="header-disconnect-btn"
              disabled={disconnectLoading}
              title="Disconnect wallet">
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="header-connect-btn"
            disabled={connectLoading || !providerReady}>
            {connectLoading ? "•••" : "Connect"}
          </button>
        )}
      </div>
    </header>
  );
}
