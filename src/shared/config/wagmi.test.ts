import {describe, expect, it} from 'vitest'
import {formatAddress, formatPasBalance, passetHub} from './wagmi'

describe('formatPasBalance', () => {
  it('formats whole and fractional PAS', () => {
    expect(formatPasBalance(0n)).toBe('0.00')
    expect(formatPasBalance(1_000_000_000_000_000_000n)).toBe('1.00')
    expect(formatPasBalance(1_234_500_000_000_000_000n)).toBe('1.2345')
  })

  it('makes tiny positive amounts visible instead of rounding to zero', () => {
    expect(formatPasBalance(1n)).toBe('<0.00001')
    expect(formatPasBalance(9_999_999_999_999n)).toBe('<0.00001')
  })
})

describe('formatAddress', () => {
  it('shortens long addresses', () => {
    expect(formatAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x12...678')
  })

  it('returns short input unchanged', () => {
    expect(formatAddress('0x1234')).toBe('0x1234')
  })
})

describe('passetHub chain', () => {
  it('targets Polkadot Hub TestNet', () => {
    expect(passetHub.id).toBe(420420417)
    expect(passetHub.nativeCurrency.symbol).toBe('PAS')
    expect(passetHub.rpcUrls.default.http.length).toBeGreaterThan(0)
  })
})
