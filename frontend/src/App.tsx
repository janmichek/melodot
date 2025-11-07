import "./App.css";
import {useEffect, useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect,} from "@web3auth/modal/react";
import {useAccount} from "wagmi";
import {donateConfig} from "./generated";
import {passetHub} from "./wagmi-config";
import {AppSidebar} from "./components/AppSidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Home} from "./pages/Home";
import {Claim} from "./pages/Claim";
import {Owner} from "./pages/Owner";

export function useWeb3AuthContext() {
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
  const [providerReady, setProviderReady] = useState(false);

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

  return {
    isConnected,
    address,
    connect,
    disconnect,
    connectLoading,
    disconnectLoading,
    providerReady,
    contractAddress,
  };
}

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <SidebarInset className="bg-background">
          <header className="border-b border-border sticky top-0 bg-background">
            <div className="flex items-center justify-end px-4 py-3">
              <SidebarTrigger />
            </div>
          </header>
          <div className="flex flex-1 flex-col p-4">
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/claim" element={<Claim />} />
                <Route path="/owner" element={<Owner />} />
              </Routes>
            </main>
          </div>
        </SidebarInset>
        <AppSidebar />
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
