import { useWeb3AuthContext } from "./Layout";
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/mode-toggle";

export function Header() {
  const {
    isConnected,
    address,
    connect,
    connectLoading,
    providerReady,
  } = useWeb3AuthContext();

  return (
    <header className="dapp-header-subtle">
      <div className="header-content-subtle">
        <ModeToggle />
        {isConnected && address ? (
          <UserMenu />
        ) : (
          <Button
            onClick={() => connect()}
            disabled={connectLoading || !providerReady}
            variant="default"
            size="default">
            {connectLoading ? "•••" : "Connect"}
          </Button>
        )}
      </div>
    </header>
  );
}
