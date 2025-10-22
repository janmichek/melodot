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
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
    chainId: passetHub.id,
  });

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-3)}`;
  };

  const getChainName = () => {
    if (chainId === passetHub.id) return "Passet Hub";
    if (chainId === 1) return "Ethereum";
    return "Unknown";
  };

  const formatBalance = () => {
    if (!balance) return "0";
    const formatted = formatUnits(balance.value, balance.decimals);
    const num = parseFloat(formatted);
    return num.toFixed(2);
  };

  return (
    <header className="dapp-header-subtle">
      <div className="header-content-subtle">
        {isConnected && address ? (
          <div className="header-info-compact">
            <div className="header-chain-badge">{getChainName()}</div>
            <div className="header-divider">|</div>
            <div className="header-balance">{formatBalance()} {balance?.symbol || CURRENCY_SYMBOL}</div>
            <div className="header-divider">|</div>
            <a
              href="https://faucet.polkadot.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="header-faucet-link"
              title="Get test tokens"
            >
              Faucet
            </a>
            <div className="header-divider">|</div>
            <div className="header-address">{formatAddress(address)}</div>
            <button
              onClick={onDisconnect}
              className="header-disconnect-btn"
              disabled={disconnectLoading}
              title="Disconnect wallet"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="header-connect-btn"
            disabled={connectLoading || !providerReady}
          >
            {connectLoading ? "•••" : "Connect"}
          </button>
        )}
      </div>
    </header>
  );
}
