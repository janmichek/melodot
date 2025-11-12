// @ts-check

import {useEffect, useRef} from "react";
import {useBalance, useChainId} from "wagmi";
import {CURRENCY_SYMBOL, formatAddress, formatPasBalance, passetHub} from "../wagmi-config";
import {useWeb3AuthContext} from "../App";
import {Spinner} from "./ui/spinner";
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
    disconnecting,
  } = useWeb3AuthContext();

  const jazzRef = useRef(/** @type {HTMLDivElement|null} */ (null));

  const chainId = useChainId();

  const {data: balance, isLoading: balanceLoading} = useBalance({
    address: address,
    chainId: passetHub.id,
  });

  const formattedBalance =
    balance && balance.value
      ? `${formatPasBalance(balance.value)} ${CURRENCY_SYMBOL}`
      : `0 ${CURRENCY_SYMBOL}`;

  const getChainName = () => {
    if (chainId === passetHub.id) return "Passet Hub";
    if (chainId === 1) return "Ethereum";
    return "Unknown";
  };

  // Generate Jazzicon
  useEffect(() => {
    if (jazzRef.current && address) {
      jazzRef.current.innerHTML = "";
      const icon = Jazzicon(32, parseInt(address.slice(2, 10), 16));
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
                  className="truncate font-medium"
                >
                  {formatAddress(address, 8, 5)}
                </span>
                <div className="truncate text-xs text-muted-foreground">
                  {balanceLoading ? (
                    <Spinner size="sm" className="inline" />
                  ) : (
                    formattedBalance
                  )}
                </div>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right">
            <div className="px-2 py-1.5 text-sm">
              <div className="text-xs text-muted-foreground">Network</div>
              <div className="font-medium">{getChainName()}</div>
            </div>
            <DropdownMenuSeparator/>
            <DropdownMenuItem onClick={() => disconnect()}>
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
