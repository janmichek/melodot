import {useEffect, useMemo} from "react"
import {useAccount, useBalance, useReadContract} from "wagmi"
import type {Abi} from "viem"
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext"
import {UserMenu} from "@/components/UserMenu"
import {Button} from "@/components/ui/button"
import {ModeToggle} from "@/components/ui/mode-toggle"
import {Separator} from "@/components/ui/separator"
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
} from "@/components/ui/sidebar"
import {ChartBarIcon, Coins, ExternalLink, Info, List, Mic, Wallet} from "lucide-react"
import {Link, useLocation} from "react-router-dom"
import {Spinner} from "@/components/ui/spinner"
import {Logo} from "@/components/ui/logo"
import {donateConfig} from "@/generated"
import {passetHub} from "@/wagmi-config"

export function AppSidebar() {
  const {
    isConnected,
    address,
    connect,
    connecting,
    disconnecting,
    providerReady,
    contractAddress,
  } = useWeb3AuthContext()
  const {address: connectedAddress} = useAccount()
  
  const location = useLocation()
  const {setOpenMobile} = useSidebar()
  
  // Check balance for zero balance detection
  const {data: balance, isLoading: balanceLoading} = useBalance({
    address: address,
    chainId: passetHub.id,
    query: {
      enabled: isConnected && !!address,
    },
  })
  
  const hasZeroBalance = !balanceLoading && balance && balance.value === 0n
  
  // Check if connected user is the contract owner
  const {data: ownerAddress} = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: donateConfig.abi as Abi,
    functionName: "owner",
    query: {
      enabled: !!contractAddress && isConnected,
    },
  })
  
  const ownerWalletAddress = ownerAddress as `0x${string}` | undefined
  const isOwner =
    !!ownerWalletAddress &&
    !!connectedAddress &&
    connectedAddress.toLowerCase() === ownerWalletAddress.toLowerCase()
  
  useEffect(() => {
    setOpenMobile(false)
  }, [location.pathname, setOpenMobile])
  
  const menuItems = useMemo(() => {
    const baseItems = [
      {
        title: "Discover",
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
        url: "/about",
        icon: Info,
      },
      {
        title: "Statistics",
        url: "/statistics",
        icon: ChartBarIcon,
      },
    ]

    if (isOwner) {
      baseItems.push({
        title: "Owner",
        url: "/owner",
        icon: Wallet,
      })
    }

    return baseItems
  }, [isOwner])
  
  return (
    <Sidebar side="right" collapsible="offcanvas" className="border-l border-border/60">
      <SidebarHeader className="border-b border-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 px-2 hover:bg-transparent">
              <Link to="/" className="flex items-center gap-3">
                <Logo size="xl" className="!h-9 !w-9 text-sidebar-foreground" />
                <span className="text-xl font-semibold">
                  Melodot
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarMenuItem>
            {!providerReady && !isConnected && !disconnecting ? (
              <div className="flex w-full items-center justify-center rounded-md px-3 py-2 h-12">
                <Spinner size="md" />
              </div>
            ) : isConnected && address && !disconnecting ? (
              <UserMenu/>
            ) : (
              <SidebarMenuButton asChild>
                <Button
                  onClick={() => connect()}
                  disabled={connecting || disconnecting}
                  size="xl"
                  className="w-full">
                  {connecting || disconnecting ? <Spinner size="sm" className="inline"/> : "Sign In"}
                </Button>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
          
          {hasZeroBalance && (
          <SidebarMenuItem
            className="text-yellow-600 dark:text-yellow-500">
            <SidebarMenuButton
              asChild>
              <a
                href={passetHub.faucetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2">
                <ExternalLink className="mr-2 h-4 w-4"/>
                <span>Get Test Tokens</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          )}
        </SidebarGroup>

        <Separator className="my-2"/>

        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  className="justify-start"
                  size="lg">
                  <Link to={item.url} className="flex w-full items-center gap-3">
                    <item.icon className="h-5 w-5"/>
                    <span className="truncate text-base">
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
        <ModeToggle/>
      </SidebarFooter>
    </Sidebar>
  )
}
