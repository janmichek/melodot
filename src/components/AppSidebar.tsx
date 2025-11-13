import {useEffect} from "react";
import {useWeb3AuthContext} from "../App";
import {UserMenu} from "./UserMenu";
import {Button} from "@/components/ui/button";
import {ModeToggle} from "./ui/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {Coins, List, Mic} from "lucide-react";
import {Link, useLocation} from "react-router-dom";
import {useReadContract} from "wagmi";
import type {Abi} from "viem";
import {donateConfig} from "../generated";
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
  const {setOpenMobile} = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  const {data: balance} = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "balance",
  });

  const menuItems = [
    {
      title: "Analyze",
      url: "/",
      icon: Mic,
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

  const renderConnectArea = () => {
    if (isConnected && address) {
      return <UserMenu />;
    }

    return (
      <Button
        onClick={() => connect()}
        disabled={connecting || !providerReady}
        className="w-full"
      >
        {connecting || !providerReady ? <Spinner size="sm" className="inline" /> : "Connect"}
      </Button>
    );
  };

  return (
    <Sidebar side="right" collapsible="icon" className="border-l border-border/60">
      <SidebarHeader className="border-b border-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 px-2 data-[state=collapsed]/sidebar-wrapper:justify-center"
            >
              <Link to="/" className="flex items-center gap-2">
                <img src={LogoSvg} alt="BeatChain Logo" className="h-6 w-6" />
                <span className="text-base font-semibold group-data-[state=collapsed]/sidebar-wrapper:hidden">
                  BeatChain
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-6">
        <SidebarGroup className="group-data-[state=collapsed]/sidebar-wrapper:hidden">
          {renderConnectArea()}
        </SidebarGroup>

        <SidebarGroup className="gap-3">
          {(!balance || balance === 0n) && (
            <SidebarMenu className="group-data-[state=collapsed]/sidebar-wrapper:hidden">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="https://faucet.polkadot.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    💧 Get Test Tokens
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}

          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  className="justify-start"
                >
                  <Link to={item.url} className="flex w-full items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span className="truncate group-data-[state=collapsed]/sidebar-wrapper:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 gap-4">
        <div className="flex items-center justify-center">
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
