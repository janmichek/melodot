import { useState } from "react";
import { useBalance, useChainId } from "wagmi";
import { passetHub, CURRENCY_SYMBOL, formatAddress } from "../wagmi-config";
import { formatUnits } from "viem";
import { Link, useLocation } from "react-router-dom";

interface HeaderProps {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  onConnect: () => void;
  onDisconnect: () => void;
  connectLoading: boolean;
  disconnectLoading: boolean;
  providerReady: boolean;
}

function Navigation() {
  const location = useLocation();

  return (
    <nav className="header-nav">
      <Link to="/" className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
        Home
      </Link>
      <Link to="/claim" className={`header-nav-link ${location.pathname === '/claim' ? 'active' : ''}`}>
        Claim
      </Link>
      <Link to="/admin" className={`header-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
        Admin
      </Link>
    </nav>
  );
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
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="dapp-header-subtle">
      <div className="header-content-subtle">
        <Navigation />
        {isConnected && address ? (
          <div className="header-info-compact">
            <div className="header-chain-badge">{getChainName()}</div>
            <div className="header-divider">|</div>
            <div className="header-balance">
              {isLoading ? '...' : balance?.value !== undefined
                ? `${formatUnits(balance.value, balance.decimals)} ${balance.symbol || CURRENCY_SYMBOL}`
                : '---'}
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
              {copied ? "✓ Copied!" : formatAddress(address, 4, 3)}
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
