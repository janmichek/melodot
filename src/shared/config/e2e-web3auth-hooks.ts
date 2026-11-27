/** Test-only connection hooks with a stable disconnected state. */
const noop = async () => undefined

export function useWeb3Auth() {
  return {web3Auth: {status: 'ready'}} as never
}

export function useWeb3AuthConnect() {
  return {connect: noop, isConnected: false, loading: false} as never
}

export function useWeb3AuthDisconnect() {
  return {disconnect: noop, loading: false} as never
}
