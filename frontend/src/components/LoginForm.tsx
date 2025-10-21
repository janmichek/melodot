interface LoginFormProps {
  providerLoading: boolean;
  providerReady: boolean;
  providerError: boolean;
  connectLoading: boolean;
  connectError: Error | null;
  isConnected: boolean;
  web3AuthStatus: string | undefined;
  onConnect: () => void;
}

export function LoginForm({
  providerLoading,
  providerReady,
  providerError,
  connectLoading,
  connectError,
  isConnected,
  web3AuthStatus,
  onConnect,
}: LoginFormProps) {
  return (
    <div className="grid">
      <div className="educational-message">
        <h2>
          👋 Connect with your social accounts to explore Web3 without wallet
          extensions!
        </h2>
        <p>
          See what's possible with Asset Hub interactions - no MetaMask or
          browser wallet required. Just use your existing social logins to get
          started.
        </p>
      </div>

      {/* Provider initialization status */}
      {providerLoading && (
        <div className="loading">Initializing Web3Auth provider...</div>
      )}

      {/* Login button - only show when provider is ready */}
      {!providerLoading && providerReady && (
        <button
          onClick={() => {
            // Since the button only appears when ready, we should always be able to connect
            if (web3AuthStatus === "ready" && !connectLoading && !isConnected) {
              onConnect();
            }
          }}
          className="card"
          disabled={!providerReady || connectLoading || isConnected}
        >
          Login
        </button>
      )}

      {/* Provider failed to initialize */}
      {!providerLoading && !providerReady && providerError && !connectLoading && (
        <div className="error">
          Web3Auth provider failed to initialize after 30 seconds. Please check
          your internet connection and reload the page.
        </div>
      )}

      {/* Provider ready but can't connect (network issues) */}
      {!providerLoading && !providerReady && !providerError && !connectLoading && (
        <div className="error">
          Web3Auth provider is not ready for login. Please wait or reload the
          page.
        </div>
      )}

      {connectLoading && <div className="loading">Connecting...</div>}
      {connectError && <div className="error">{connectError.message}</div>}
    </div>
  );
}
