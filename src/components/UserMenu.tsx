import {useEffect, useRef, useState} from "react"
import {useNavigate} from "react-router-dom"
import {useBalance} from "wagmi"
import {CURRENCY_SYMBOL, formatAddress, formatPasBalance, polkadotTestnet} from "@/wagmi-config"
import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext"
import {Spinner} from "@/components/ui/spinner"
import Jazzicon from "@metamask/jazzicon"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {Check, Copy, ExternalLink, LogOut} from "lucide-react"

export function UserMenu() {
  const {
    address,
    disconnect,
  } = useWeb3AuthContext()
  const navigate = useNavigate()

  const jazzRef = useRef<HTMLDivElement>(null)
  const [isCopied, setIsCopied] = useState(false)

  const {data: balance, isLoading: balanceLoading} = useBalance({
    address: address,
    chainId: polkadotTestnet.id,
  })

  const formattedBalance =
    balance && balance.value
      ? `${formatPasBalance(balance.value)} ${CURRENCY_SYMBOL}`
      : `0 ${CURRENCY_SYMBOL}`

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (address) {
      try {
        await navigator.clipboard.writeText(address)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy address:', err)
      }
    }
  }

  // Generate Jazzicon
  useEffect(() => {
    if (jazzRef.current && address) {
      jazzRef.current.innerHTML = ""
      const icon = Jazzicon(32, parseInt(address.slice(2, 10), 16))
      jazzRef.current.appendChild(icon)
    }
  }, [address])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer">
          <div
            ref={jazzRef}
            className="h-8 w-8 rounded-lg"/>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">
                {formatAddress(address as `0x${string}`, 8, 5)}
              </span>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {balanceLoading ? (
                <Spinner size="sm" className="inline" />
                  ) : (
                    formattedBalance
                  )}
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right">
        <DropdownMenuItem
          onClick={handleCopyAddress}
          title="Copy address">
          {isCopied ? (
            <Check className="mr-2 h-4 w-4 text-green-600"/>
          ) : (
            <Copy className="mr-2 h-4 w-4"/>
          )}
          {isCopied ? "Copied" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(polkadotTestnet.faucetUrl, '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4"/>
          Faucet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={async () => {
              await disconnect()
              navigate("/")
            }}>
          <LogOut className="mr-2 h-4 w-4"/>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
