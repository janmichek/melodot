import type {ReactNode} from 'react'

/** Test-only provider shell; no external Web3Auth project config is fetched. */
export function Web3AuthProvider({children}: {children: ReactNode}) {
  return <>{children}</>
}
