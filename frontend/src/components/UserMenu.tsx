import {useEffect, useRef, useState} from "react";
import type {Abi} from "viem";
import {useBalance, useChainId, useReadContract} from "wagmi";
import {Link} from "react-router-dom";
import {formatAddress, passetHub} from "../wagmi-config";
import {donateConfig} from "../generated";
import {useWeb3AuthContext} from "../App";
import {BalanceDisplay} from "./ui/BalanceDisplay";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {ModeToggle} from "@/components/ui/mode-toggle";
import Jazzicon from "@metamask/jazzicon";

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
  });

  const isOwner = !!(address && owner && address.toLowerCase() === String(owner).toLowerCase());

  // Generate Jazzicon
  useEffect(() => {
    if (jazzRef.current && address) {
      jazzRef.current.innerHTML = "";
      // Convert address to a number for Jazzicon
      const num = parseInt(address.slice(2, 10), 16);
      const icon = Jazzicon(32, num);
      jazzRef.current.appendChild(icon);
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

        <div className="menu-divider" />

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

        <Button
          onClick={() => {
            disconnect();
          }}
          disabled={disconnectLoading}
          title="Disconnect wallet"
        >
          {disconnectLoading ? "•••" : "Disconnect Wallet"}
        </Button>

        <ModeToggle />
      </div>
    </div>
  );
}
