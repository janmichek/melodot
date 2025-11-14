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
import {Spinner} from "@/components/ui/spinner";
import {Logo} from "./Logo";

export function AppSidebar() {
  const {
    isConnected,
    address,
    connect,
    connecting,
    providerReady,
  } = useWeb3AuthContext();

  const location = useLocation();
  const {setOpenMobile} = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

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
    <Sidebar side="right" collapsible="offcanvas" className="border-l border-border/60">
      <SidebarHeader className="border-b border-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 px-2 hover:bg-transparent"
            >
              <Link to="/" className="flex items-center gap-2">
                <Logo className="h-6 w-6 text-sidebar-foreground" />
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
          {renderConnectArea()}
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
