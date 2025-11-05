import { useWeb3AuthContext } from "./Layout";
import { UserMenu } from "./UserMenu";

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
          <UserMenu />
        ) : (
          <button
            onClick={() => connect()}
            className="header-connect-btn"
            disabled={connectLoading || !providerReady}>
            {connectLoading ? "•••" : "Connect"}
          </button>
        )}
      </div>
    </header>
  );
}
