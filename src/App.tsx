import "./App.css";
import {type CSSProperties, useEffect, useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect} from "@web3auth/modal/react";
import {useAccount} from "wagmi";
import {donateConfig} from "./generated";
import {passetHub} from "./wagmi-config";
import {AppSidebar} from "./components/AppSidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {Analyze} from "./pages/Analyze";
import {Claim} from "./pages/Claim";
import {Donations} from "./pages/Donations";
import {Owner} from "./pages/Owner";
import {Header} from "./components/Header";

export function useWeb3AuthContext() {
  const {
    connect,
    isConnected,
    loading: connecting,
  } = useWeb3AuthConnect();
  const {
    disconnect,
    loading: disconnecting,
  } = useWeb3AuthDisconnect();

  const { web3Auth } = useWeb3Auth();
  const { address } = useAccount();
  const [providerReady, setProviderReady] = useState(false);

  useEffect(() => {
    const verifyProviderReady = () => {
      if (web3Auth) {
        try {
          const isInitialized = web3Auth.status === "ready";
          const isReadyToLogin = isInitialized && !connecting;

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
  }, [web3Auth, connecting]);

  const contractAddress = donateConfig.address[passetHub.id];

  return {
    isConnected,
    address,
    connect,
    disconnect,
    connecting,
    disconnecting,
    providerReady,
    contractAddress,
  };
}

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider
        defaultOpen
        style={
          {
            "--sidebar-width": "19rem",
            "--sidebar-width-mobile": "18rem",
          } as CSSProperties
        }
      >
        <SidebarInset className="bg-background flex flex-col min-h-0">
          <Header />
          <div className="@container/main flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto overflow-x-hidden scrollbar-hide min-h-0">
            <main className="flex flex-1 flex-col min-h-0">
              <Routes>
                <Route path="/" element={<Analyze />} />
                <Route path="/donations" element={<Donations />} />
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
