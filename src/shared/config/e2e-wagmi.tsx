import type {ReactNode} from 'react'
import {WagmiProvider as WagmiProviderBase} from 'wagmi'
import {wagmiConfig} from './wagmi'

/** Real wagmi, but without Web3Auth's injected transport config. */
export function WagmiProvider({children}: {children: ReactNode}) {
  return <WagmiProviderBase config={wagmiConfig}>{children}</WagmiProviderBase>
}
