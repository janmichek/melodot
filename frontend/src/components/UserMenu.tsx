import { useState, useRef, useEffect } from "react";
import { formatUnits } from "viem";
import { useReadContract, useChainId, useBalance } from "wagmi";
import { Link } from "react-router-dom";
import { CURRENCY_SYMBOL, formatAddress, passetHub } from "../wagmi-config";
import { donateConfig } from "../generated";
import { useWeb3AuthContext } from "./Layout";
import type { Abi } from "viem";

interface UserMenuProps {
  onCopyAddress: () => void;
  copied: boolean;
}

// Generate deterministic number from address (similar to jsNumberForAddress)
function addressToNumber(address: string): number {
  const hash = address.slice(2).substring(0, 8);
  return parseInt(hash, 16);
}

export function UserMenu({ onCopyAddress, copied }: UserMenuProps) {
  const {
    address,
    disconnect,
    disconnectLoading,
    contractAddress,
  } = useWeb3AuthContext();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const jazzRef = useRef<HTMLDivElement>(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button
        className="user-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Account menu"
      >
        <div
          ref={jazzRef}
          className="user-identicon"
        />
        <span className="user-menu-caret">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          {/* Top Section: Address, Balance, Faucet */}
          <div className="menu-item-section">
            <div className="menu-label">Address</div>
            <div
              className={`menu-address ${copied ? 'menu-address-copied' : ''}`}
              onClick={onCopyAddress}
              title={copied ? "Copied!" : "Click to copy"}
            >
              {copied ? "✓ Copied" : formatAddress(address || "0x0000000000000000000000000000000000000000" as `0x${string}`, 4, 3)}
            </div>
          </div>

          <div className="menu-item-section">
            <div className="menu-label">Balance</div>
            <div className="menu-value">
              {balanceLoading ? '...' : balance?.value !== undefined
                ? `${formatUnits(balance.value, balance.decimals)} ${balance.symbol || CURRENCY_SYMBOL}`
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

          <Link
            to="/claim"
            className="menu-claim-link"
            onClick={() => setIsOpen(false)}
            title="Claim artist balance"
          >
            📋 Claim
          </Link>

          {isOwner && (
            <Link
              to="/admin"
              className="menu-admin-link"
              onClick={() => setIsOpen(false)}
              title="Admin panel"
            >
              ⚙️ Admin Panel
            </Link>
          )}

          {/* Disconnect Button */}
          <button
            onClick={() => {
              disconnect();
              setIsOpen(false);
            }}
            className="menu-disconnect-btn"
            disabled={disconnectLoading}
            title="Disconnect wallet"
          >
            {disconnectLoading ? "•••" : "Disconnect Wallet"}
          </button>
        </div>
      )}
    </div>
  );
}
