import "./App.css";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3Auth,
} from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { donateConfig } from "./generated";
import { passetHub } from "./wagmi-config";
import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import AudioRecorder from "./components/AudioRecorder";
import DiscoveryCard from "./components/DiscoveryCard";
import { DonationForm } from "./components/DonationForm";
import { DiscoveryResult } from "./types";

function App() {
  const {
    connect,
    isConnected,
    loading: connectLoading,
  } = useWeb3AuthConnect();
  const {
    disconnect,
    loading: disconnectLoading,
  } = useWeb3AuthDisconnect();
  const { web3Auth } = useWeb3Auth();
  const { address } = useAccount();

  // Provider readiness state
  const [providerReady, setProviderReady] = useState(false);

  // Discovery state - lifted from AudioRecorder
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResult | null>(null);

  // Track Web3Auth provider initialization
  useEffect(() => {
    const checkProviderStatus = () => {
      if (web3Auth) {
        try {
          const isInitialized = web3Auth.status === "ready";
          const isNotConnecting = !connectLoading;
          const canLogin = isInitialized && isNotConnecting;

          setProviderReady(canLogin);

          if (canLogin) {
            return true;
          }
        } catch (error) {
          console.error("Error checking Web3Auth status:", error);
          setProviderReady(false);
        }
      } else {
        setProviderReady(false);
      }
      return false;
    };

    if (checkProviderStatus()) {
      return;
    }

    const interval = setInterval(() => {
      if (checkProviderStatus()) {
        clearInterval(interval);
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.warn("Web3Auth initialization timeout");
      setProviderReady(false);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [web3Auth, connectLoading]);

  const contractAddress = donateConfig.address[passetHub.id];

  const handleDonateClick = () => {
    if (!isConnected) {
      void connect();
    }
  };

  return (
    <div className="container">
      <Header
        isConnected={isConnected}
        address={address}
        onConnect={() => connect()}
        onDisconnect={() => disconnect()}
        connectLoading={connectLoading}
        disconnectLoading={disconnectLoading}
        providerReady={providerReady}
      />

      <main className="main-content">
        {!discoveryData ? (
          <AudioRecorder onAnalysisComplete={setDiscoveryData} />
        ) : (
          <div className="discovery-section">
            <button
              onClick={() => setDiscoveryData(null)}
              className="btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              ← Search Again
            </button>

            <DiscoveryCard discovery={discoveryData} />

            {contractAddress && (
              <DonationForm
                contractAddress={contractAddress}
                onSuccess={() => console.log("Donation successful")}
                onRequireAuth={handleDonateClick}
              />
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
