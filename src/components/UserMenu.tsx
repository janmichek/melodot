import {useEffect, useRef} from "react";
import {useBalance, useChainId} from "wagmi";
import {formatAddress, passetHub} from "../wagmi-config";
import {useWeb3AuthContext} from "../App";
import {BalanceDisplay} from "./ui/BalanceDisplay";
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
    disconnectLoading,
  } = useWeb3AuthContext();

  const jazzRef = useRef<HTMLDivElement>(null);

  const chainId = useChainId();

  const {data: balance, isLoading: balanceLoading} = useBalance({
    address: address,
    chainId: passetHub.id,
  });

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
                  className="truncate font-medium">{formatAddress(address as `0x${string}`, 8, 5)}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {balanceLoading ? (
                    <Spinner size="sm" className="inline"/>
                  ) :
                    <BalanceDisplay
                    balance={balance?.value}
                    isLoading={balanceLoading}
                    showSymbol={true}
                    size="small"
                  />
                  }
                </span>
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
