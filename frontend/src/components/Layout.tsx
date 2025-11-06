import { useState, useEffect, ReactNode } from "react";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3Auth,
} from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { donateConfig } from "../generated";
import { passetHub } from "../wagmi-config";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

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

export function Layout({ children }: {children: ReactNode;}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header >
          <SidebarTrigger className="ml-auto" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <main className="main-content">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
