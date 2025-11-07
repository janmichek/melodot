import {useWeb3AuthContext} from "../App";
import {UserMenu} from "./UserMenu";
import {Button} from "@/components/ui/button";

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
        {isConnected && address ? (
          <UserMenu/>
        ) : (
          <Button
            onClick={() => connect()}
            disabled={connectLoading || !providerReady}
            variant="default"
            size="default">
            {connectLoading && (
              <span className="mr-2 h-4 w-4 animate-spin">◌</span>
            )}
            {connectLoading ? "Loading" : "Connect"}
          </Button>
        )}
      </div>
    </header>
  );
}
