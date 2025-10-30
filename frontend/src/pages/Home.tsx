import { useState } from "react";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3Auth,
} from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { donateConfig } from "../generated";
import { passetHub } from "../wagmi-config";
import { useEffect } from "react";
import { Header } from "../components/Header";
import AudioRecorder from "../components/AudioRecorder";
import DiscoveryCard from "../components/DiscoveryCard";
import { DonationForm } from "../components/DonationForm";
import { ContractInfoFooter } from "../components/ContractInfoFooter";
import { DiscoveryResult } from "../types";

export function Home() {
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
// todo can i move this component higher?
  const [providerReady, setProviderReady] = useState(false);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResult | null>(null);

  useEffect(() => {
    const verifyProviderReady = () => {
      if (web3Auth) {
        try {
          const isInitialized = web3Auth.status === "ready";
          const isNotConnecting = !connectLoading;
          const isReadyToLogin = isInitialized && isNotConnecting;

          setProviderReady(isReadyToLogin);

          if (isReadyToLogin) {
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

    if (verifyProviderReady()) {
      return;
    }

    const interval = setInterval(() => {
      if (verifyProviderReady()) {
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

  const artistId = discoveryData?.track?.artists?.[0]?.adamid;

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
          <>
            <DiscoveryCard
              discovery={discoveryData}
              onSearchAgain={() => setDiscoveryData(null)}
            />

            {contractAddress && artistId && (
              <DonationForm
                contractAddress={contractAddress}
                artistId={artistId}
                onSuccess={() => alert("Donation successful")}
                onRequireAuth={handleDonateClick}
              />
            )}
          </>
        )}
      </main>

      <ContractInfoFooter contractAddress={contractAddress} />
    </div>
  );
}
