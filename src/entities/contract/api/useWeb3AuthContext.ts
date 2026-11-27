import {useEffect, useState} from "react"
import {useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect} from "@web3auth/modal/react"
import {useAccount} from "wagmi"
import {isAddress} from "viem"
import {donateConfig} from "@/shared/config"
import {passetHub} from "@/shared/config"

export function useWeb3AuthContext() {
  const {
    connect,
    isConnected,
    loading: connecting,
  } = useWeb3AuthConnect()
  const {
    disconnect,
    loading: disconnecting,
  } = useWeb3AuthDisconnect()

  const {web3Auth} = useWeb3Auth()
  const {address} = useAccount()
  const [providerReady, setProviderReady] = useState(false)

  useEffect(() => {
    const verifyProviderReady = () => {
      if (web3Auth) {
        try {
          const isInitialized = web3Auth.status === "ready"
          const isReadyToLogin = isInitialized && !connecting && !disconnecting

          setProviderReady(isReadyToLogin)

          if (isReadyToLogin) {
            return true
          }
        } catch (error) {
          console.error("Error checking Web3Auth status:", error)
          setProviderReady(false)
        }
      } else {
        setProviderReady(false)
      }
      return false
    }

    if (verifyProviderReady()) {
      return
    }

    const interval = setInterval(() => {
      if (verifyProviderReady()) {
        clearInterval(interval)
      }
    }, 200)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      console.warn("Web3Auth initialization timeout")
      setProviderReady(false)
    }, 30000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [web3Auth, connecting, disconnecting])

  const configuredAddress = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}` | undefined
  const contractAddress =
    configuredAddress && isAddress(configuredAddress)
      ? configuredAddress
      : donateConfig.address[passetHub.id]

  return {
    isConnected,
    address,
    connect,
    disconnect,
    connecting,
    disconnecting,
    providerReady,
    contractAddress,
  }
}
