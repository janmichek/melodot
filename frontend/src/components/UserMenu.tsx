import { useState, useRef, useEffect } from "react";
import { formatUnits } from "viem";
import { useReadContract, useChainId, useBalance } from "wagmi";
import { Link } from "react-router-dom";
import { CURRENCY_SYMBOL, formatAddress, passetHub } from "../wagmi-config";
import { donateConfig } from "../generated";
import { useWeb3AuthContext } from "./Layout";
import { BalanceDisplay } from "./ui/BalanceDisplay";
import type { Abi } from "viem";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";

// Generate deterministic number from address (similar to jsNumberForAddress)
function addressToNumber(address: string): number {
  const hash = address.slice(2).substring(0, 8);
  return parseInt(hash, 16);
}

export function UserMenu() {
  const {
    address,
    disconnect,
    disconnectLoading,
    contractAddress,
  } = useWeb3AuthContext();

  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const jazzRef = useRef<HTMLDivElement>(null);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address).catch(err => {
        console.error('Failed to copy address:', err);
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const chainId = useChainId();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: passetHub.id,
  });

  const getChainName = () => {
    if (chainId === passetHub.id) return "Passet Hub";
    if (chainId === 1) return "Ethereum";
    return "Unknown";
  };

  // Read contract owner
  const { data: owner } = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: donateConfig.abi as Abi,
    functionName: "owner",
    query: { enabled: !!contractAddress }
  });

  const isOwner = !!(address && owner && address.toLowerCase() === String(owner).toLowerCase());

  // Generate Jazzicon
  useEffect(() => {
    if (jazzRef.current && address) {
      jazzRef.current.innerHTML = "";
      const num = addressToNumber(address);
      const hue1 = num % 360;
      const hue2 = (num + 120) % 360;

      const jazziconSvg = `
        <svg height="32" width="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g-${num}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:hsl(${hue1},100%,50%);stop-opacity:1" />
              <stop offset="100%" style="stop-color:hsl(${hue2},100%,50%);stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" fill="url(#g-${num})" rx="50%" />
          <circle cx="16" cy="16" r="10" fill="white" opacity="0.2" />
          <circle cx="10" cy="10" r="2" fill="white" opacity="0.4" />
        </svg>
      `;
      jazzRef.current.innerHTML = jazziconSvg;
    }
  }, [address]);

  return (
    <div className="user-menu-container" ref={menuRef}>
      <div className="flex flex-row">
      <div
        ref={jazzRef}
        className="user-identicon"
      />
        <div
          className={`menu-address ${copied ? 'menu-address-copied' : ''}`}
          onClick={handleCopyAddress}
          title={copied ? "Copied!" : "Click to copy"}
        >
          {copied ? "✓ Copied" : formatAddress(address || "0x0000000000000000000000000000000000000000" as `0x${string}`, 4, 3)}
        </div>
        <Separator/>
      </div>
      <div className="user-menu-dropdown">

        <div className="menu-item-section">
          <div className="menu-label">Balance</div>
          <div className="menu-value">
            {balanceLoading ? '...' : balance?.value !== undefined
              ? <BalanceDisplay
                balance={balance?.value}
                isLoading={balanceLoading}
                showSymbol={true}
                size="small"
              />
              : '---'}
          </div>
        </div>

        <a
          href="https://faucet.polkadot.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="menu-faucet-link menu-faucet-btn"
        >
          💧 Get Test Tokens
        </a>

        {/* Divider */}
        <div className="menu-divider" />

        {/* Middle Section: Navigation and Network */}
        <div className="menu-item-section">
          <div className="menu-label">Network</div>
          <div className="menu-value">{getChainName()}</div>
        </div>

        {isOwner && (
          <Link
            to="/owner"
            className="menu-owner-link"
            title="Owner panel"
          >
            ⚙️ Owner Panel
          </Link>
        )}

        {/* Disconnect Button */}
        <Button
          onClick={() => {
            disconnect();
          }}
          disabled={disconnectLoading}
          title="Disconnect wallet"
        >
          {disconnectLoading ? "•••" : "Disconnect Wallet"}
        </Button>
      </div>
    </div>
  );
}
