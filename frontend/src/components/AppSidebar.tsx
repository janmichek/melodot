import { useState } from "react";
import { useWeb3AuthContext } from "../App";
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Coins } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useReadContract } from "wagmi";
import type { Abi } from "viem";
import { donateConfig } from "../generated";
import { passetHub, formatAddress } from "../wagmi-config";
import { BalanceDisplay } from "./ui/BalanceDisplay";
import {Footer} from "@/components/Footer";

export function AppSidebar() {
  const {
    isConnected,
    address,
    connect,
    connectLoading,
    providerReady,
    contractAddress,
  } = useWeb3AuthContext();

  const location = useLocation();

  const { data: count } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "getArtistsCount",
  });

  const { data: balance } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "balance",
  });

  const menuItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Claim",
      url: "/claim",
      icon: Coins,
    },
  ];

  return (
    <Sidebar side="right" collapsible="icon" className="border-l border-border">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex flex-1 flex-col gap-3">
            <h2 className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
              Shaz
            </h2>

            {/* Connect button at top of sidebar */}
            <div className="group-data-[collapsible=icon]:hidden">
              {isConnected && address ? (
                <UserMenu />
              ) : (
                <Button
                  onClick={() => connect()}
                  disabled={connectLoading || !providerReady}
                  variant="default"
                  size="sm"
                  className="w-full">
                  {connectLoading ? "•••" : "Connect"}
                </Button>
              )}
            </div>
          </div>
          <ModeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <div className="group-data-[collapsible=icon]:hidden">
          <Footer contractAddress={contractAddress}></Footer>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
