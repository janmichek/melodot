import "./App.css";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
  useWeb3Auth,
} from "@web3auth/modal/react";
import { useAccount, useChainId } from "wagmi";
import { donateConfig } from "./generated";
import { passetHub, kusamaAssetHub, westend } from "./wagmi-config";
import { useState, useEffect } from "react";
import { LoggedInView } from "./components/LoggedInView";
import { LoginForm } from "./components/LoginForm";

function App() {
  const {
    connect,
    isConnected,
    connectorName,
    loading: connectLoading,
    error: connectError,
  } = useWeb3AuthConnect();
  const {
    disconnect,
    loading: disconnectLoading,
    error: disconnectError,
  } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { web3Auth } = useWeb3Auth();
  const { address } = useAccount();
  const chainId = useChainId();
  // todo how to use chainId?

  // Provider readiness states
  const [providerReady, setProviderReady] = useState(false);
  const [providerLoading, setProviderLoading] = useState(true);
  const [providerError, setProviderError] = useState(false);

  // Track Web3Auth provider initialization
  useEffect(() => {
    const checkProviderStatus = () => {
      if (web3Auth) {
        try {
          // Check if Web3Auth is properly initialized and ready for login
          const isInitialized = web3Auth.status === "ready";
          const isNotConnecting = !connectLoading;
          const canLogin = isInitialized && isNotConnecting;

          setProviderReady(canLogin);
          setProviderLoading(web3Auth.status !== "ready");

          // If ready, clear the interval
          if (canLogin) {
            return true; // Signal to stop interval
          }
        } catch (error) {
          console.error("Error checking Web3Auth status:", error);
          setProviderReady(false);
          setProviderLoading(true);
        }
      } else {
        // Still loading if web3Auth instance not available
        setProviderReady(false);
        setProviderLoading(true);
      }
      return false; // Continue interval
    };

    // Check immediately
    if (checkProviderStatus()) {
      return; // Already ready, no need for interval
    }

    // Set up interval to continuously check until ready
    const interval = setInterval(() => {
      if (checkProviderStatus()) {
        clearInterval(interval);
      }
    }, 200); // Check more frequently

    // Cleanup interval after 30 seconds max
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.warn("Web3Auth initialization timeout");
      setProviderLoading(false);
      setProviderError(true);
      setProviderReady(false);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [web3Auth, connectLoading]);


  const contractAddress =
    donateConfig.address[
      passetHub.id
    ];

  return (
    <div className="container">
      <h1 className="title">
        <a
          target="_blank"
          href="https://web3auth.io/docs/sdk/pnp/web/modal"
          rel="noreferrer"
        >
          Web3Auth{" "}
        </a>
      </h1>

      {isConnected ? (
        <div>
          {/*todo move user info inside LoggedInView*/}

        <LoggedInView
          connectorName={connectorName}
          address={address}
          contractAddress={contractAddress}
          onDisconnect={() => disconnect()}
          disconnectLoading={disconnectLoading}
          disconnectError={disconnectError}
          userInfo={userInfo}
        />
        </div>
      ) : (
        <LoginForm
          providerLoading={providerLoading}
          providerReady={providerReady}
          providerError={providerError}
          connectLoading={connectLoading}
          connectError={connectError}
          isConnected={isConnected}
          web3AuthStatus={web3Auth?.status}
          onConnect={() => connect()}
        />
      )}
    </div>
  );
}

export default App;
