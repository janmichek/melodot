export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export function isConfiguredAddress(address: string | undefined): address is `0x${string}` {
  return Boolean(address) && address!.toLowerCase() !== ZERO_ADDRESS
}
