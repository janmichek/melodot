import {useEffect, useRef, useState} from "react";
import type {Abi} from "viem";
import {useBalance, useChainId, useReadContract} from "wagmi";
import {formatAddress, passetHub} from "../wagmi-config";
import {donateConfig} from "../generated";
import {useWeb3AuthContext} from "../App";
import {BalanceDisplay} from "./ui/BalanceDisplay";
import Jazzicon from "@metamask/jazzicon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem,} from "@/components/ui/sidebar";

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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <div
                ref={jazzRef}
                className="h-8 w-8 rounded-lg"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span
                  className="truncate font-medium">{formatAddress(address || "0x0000000000000000000000000000000000000000" as `0x${string}`, 4, 3)}</span>
                <span className="text-muted-foreground truncate text-xs">
                {/*todo imporove */}
                  {balanceLoading ? '...' : balance?.value !== undefined ? (
                    <>
                      <BalanceDisplay
                        balance={balance?.value}
                        isLoading={balanceLoading}
                        showSymbol={true}
                        size="small"
                      />
                      {balance?.value === 0n && (
                        <a
                          href="https://faucet.polkadot.io/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="menu-faucet-link menu-faucet-btn"
                        >
                          💧 Get Test Tokens
                        </a>
                      )}
                    </>
                  ) : '---'}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="right"
            align="end"
            sideOffset={4}
          >
            <div className="px-2 py-1.5 text-sm">
              <div className="text-xs text-muted-foreground">Network</div>
              <div className="font-medium">{getChainName()}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => disconnect()} disabled={disconnectLoading}>
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
