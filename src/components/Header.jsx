// @ts-check

import {Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {ModeToggle} from "./ui/mode-toggle";
import {useWeb3AuthContext} from "../App";
import {formatAddress} from "../wagmi-config";

export function Header() {
  const {
    isConnected,
    address,
    connect,
    disconnect,
    connecting,
    disconnecting,
    providerReady,
  } = useWeb3AuthContext();

  const handleConnect = () => {
    if (!providerReady || connecting) return;
    connect();
  };

  const handleDisconnect = () => {
    if (disconnecting) return;
    disconnect();
  };

  return (
    <header
      className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
      data-testid="header"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <SidebarTrigger className="lg:hidden" />
        <div className="flex flex-1 items-center justify-end gap-3">
          {isConnected && address ? (
            <Button
              onClick={handleDisconnect}
              disabled={disconnecting}
              variant="outline"
              className="min-w-[180px] justify-between"
            >
              <span className="text-sm font-medium">
                {formatAddress(address, 6, 4)}
              </span>
              {disconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-xs text-muted-foreground">Disconnect</span>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={connecting || !providerReady}
              className="min-w-[160px] justify-center"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
