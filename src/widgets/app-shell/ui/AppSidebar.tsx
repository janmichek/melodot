import {useEffect, useMemo} from "react"
import {useAccount, useBalance, useReadContract} from "wagmi"
import type {Abi} from "viem"
import {useWeb3AuthContext} from "@/entities/contract"
import {UserMenu} from "./UserMenu"
import {Button} from "@/shared/ui/button"
import {Separator} from "@/shared/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/shared/ui/sidebar"
import {ChartBarIcon, Coins, ExternalLink, Info, List, Mic, Wallet} from "lucide-react"
import {Link, useLocation} from "react-router-dom"
import {Spinner} from "@/shared/ui/spinner"
import {Logo} from "@/shared/ui/logo"
import {donateConfig, passetHub} from "@/shared/config"

const NAV = [
  {title: "Discover", url: "/", icon: Mic},
  {title: "Donations", url: "/donations", icon: List},
  {title: "Claim", url: "/claim", icon: Coins},
  {title: "Statistics", url: "/statistics", icon: ChartBarIcon},
  {title: "About", url: "/about", icon: Info},
] as const

export function AppSidebar() {
  const {
    isConnected,
    address,
    connect,
    connecting,
    disconnecting,
    contractAddress,
  } = useWeb3AuthContext()
  const {address: connectedAddress} = useAccount()

  const location = useLocation()
  const {setOpenMobile} = useSidebar()

  const {data: balance, isLoading: balanceLoading} = useBalance({
    address,
    chainId: passetHub.id,
    query: {
      enabled: isConnected && !!address,
    },
  })

  const hasZeroBalance = !balanceLoading && balance && balance.value === 0n

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

  const menuItems = useMemo(
    () =>
      isOwner
        ? [...NAV, {title: "Owner", url: "/owner", icon: Wallet}]
        : NAV,
    [isOwner],
  )

  return (
    <Sidebar side="right" collapsible="offcanvas" className="site-index border-l border-border/60">
      <SidebarHeader className="site-index__header px-4 py-5">
        <Link to="/" className="brand-lockup">
          <Logo size="md" className="brand-lockup__mark" />
          <span className="brand-lockup__word">Donalyze</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-4">
        <SidebarGroup className="py-4">
          <SidebarMenuItem>
            {isConnected && address && !disconnecting ? (
              <UserMenu />
            ) : (
              <SidebarMenuButton asChild>
                <Button
                  onClick={() => connect()}
                  disabled={connecting || disconnecting}
                  size="xl"
                  className="w-full">
                  {connecting || disconnecting ? <Spinner size="sm" className="inline" /> : "Sign in"}
                </Button>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>

          {hasZeroBalance && (
            <SidebarMenuItem className="mt-3">
              <a
                href={passetHub.faucetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-yellow-500/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-400">
                <ExternalLink className="h-3.5 w-3.5" />
                Get test PAS
              </a>
            </SidebarMenuItem>
          )}
        </SidebarGroup>

        <Separator className="my-2 opacity-60" />

        <nav aria-label="Primary" className="py-2">
          <ul>
            {menuItems.map((item) => (
              <li key={item.title}>
                <Link
                  to={item.url}
                  className="site-index__link"
                  data-active={location.pathname === item.url}>
                  <span>{item.title}</span>
                  <item.icon className="h-4 w-4 opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SidebarContent>

      <SidebarFooter className="site-index__footer px-4 py-5">
        <p className="site-index__label">Built on</p>
        <p className="mt-1 text-xs text-foreground/80">Polkadot Hub TestNet</p>
      </SidebarFooter>
    </Sidebar>
  )
}
