import {useEffect} from "react";
import {useAccount, useReadContract} from "wagmi";
import type {Abi} from "viem";
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
import {Coins, List, Mic, Wallet} from "lucide-react";
import {Link, useLocation} from "react-router-dom";
import {Spinner} from "@/components/ui/spinner";
import logoIcon from "../assets/icons/beatchain-logo.svg";
import {donateConfig} from "../generated";

export function AppSidebar() {
  const {
    isConnected,
    address,
    connect,
    connecting,
    providerReady,
    contractAddress,
  } = useWeb3AuthContext();
  const {address: connectedAddress} = useAccount();

  const location = useLocation();
  const {setOpenMobile} = useSidebar();

  // Check if connected user is the contract owner
  const {data: ownerAddress} = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: donateConfig.abi as Abi,
    functionName: "owner",
    query: {
      enabled: !!contractAddress && isConnected,
    },
  });

  const ownerWalletAddress = ownerAddress as `0x${string}` | undefined;
  const isOwner =
    !!ownerWalletAddress &&
    !!connectedAddress &&
    connectedAddress.toLowerCase() === ownerWalletAddress.toLowerCase();

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  const menuItems = [
    {
      title: "Recognize",
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
      title: "About",
      url: "/owner",
      icon: Coins,
    },
  ];

  // todo merge it to one const , change to function and add owner condition
  const ownerMenuItems = isOwner
    ? [
        {
          title: "Withdraw Fees",
          url: "/owner",
          icon: Wallet,
        },
      ]
    : [];

  return (
    <Sidebar side="right" collapsible="offcanvas" className="border-l border-border/60">
      <SidebarHeader className="border-b border-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 px-2 hover:bg-transparent"
            >
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src={logoIcon} 
                  alt="BeatChain Logo" 
                  className="h-6 w-6 text-sidebar-foreground" 
                />
                <span className="text-base font-semibold">
                  BeatChain
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-6">
        <SidebarGroup>
          {isConnected && address ? (
            <UserMenu />
          ) : (
            <Button
              onClick={() => connect()}
              disabled={connecting || !providerReady}
              className="w-full"
            >
              {connecting || !providerReady ? <Spinner size="sm" className="inline" /> : "Sign In"}
            </Button>
          )}
        </SidebarGroup>

        <SidebarGroup className="gap-3">
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
                    <span className="truncate">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {ownerMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  className="justify-start"
                >
                  <Link to={item.url} className="flex w-full items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span className="truncate">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 gap-4 flex items-center">
          <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
