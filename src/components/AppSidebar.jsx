// @ts-check

import {useWeb3AuthContext} from "../App";
import {UserMenu} from "./UserMenu";
import {Button} from "@/components/ui/button";
import {ModeToggle} from "./ui/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {Coins, Home, List} from "lucide-react";
import {Link, useLocation} from "react-router-dom";
import {useReadContract} from "wagmi";
import {donateConfig} from "../generated";
import {Footer} from "@/components/Footer";
import {Spinner} from "@/components/ui/spinner";
import LogoSvg from "@/assets/icons/beatchain-logo.svg";

export function AppSidebar() {
  const {
    isConnected,
    address,
    connect,
    connecting,
    providerReady,
    contractAddress,
  } = useWeb3AuthContext();

  const location = useLocation();

  const {data: balance} = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi,
    functionName: "balance",
  });

  const menuItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Donations",
      url: "/donations",
      icon: List,
    },
    {
      title: "Claim",
      url: "/claim",
      icon: Coins,
    },
    {
      title: "Owner Panel",
      url: "/owner",
      icon: Coins,
    },
  ];

  return (
    <Sidebar side="right" collapsible="icon" className="border-l border-border">
      <SidebarHeader className="border-b border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className="flex items-center gap-2">
                <img src={LogoSvg} alt="BeatChain Logo" className="w-6 h-6" />
                <span className="text-base font-semibold">BeatChain</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <div className="group-data-[collapsible=icon]:hidden">
          {isConnected && address ? (
            <UserMenu/>
          ) : (
            <Button
              onClick={() => connect()}
              disabled={connecting || !providerReady}
              variant="default"
              className="w-full">
              {connecting || !providerReady ?
                <Spinner size="sm" className="inline"/>
                : "Connect"}
            </Button>
          )}
        </div>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {(!balance || balance === 0n) && (
              <SidebarMenuItem>
                <a
                  href="https://faucet.polkadot.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  💧 Get Test Tokens
                </a>
              </SidebarMenuItem>
            )}

            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild
                  isActive={location.pathname === item.url}
                >
                  <Link to={item.url} className="w-full">
                    <item.icon/>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <div className="group-data-[collapsible=icon]:hidden">
          <Footer contractAddress={contractAddress}></Footer>
        </div>
        <ModeToggle/>
      </SidebarFooter>
    </Sidebar>
  );
}
