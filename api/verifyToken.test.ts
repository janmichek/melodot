// @vitest-environment node
import {describe, expect, it} from 'vitest'
import {createChallenge, newChallengeCode, readChallenge} from './verifyToken'

const payload = {
  artistId: '6nS5roXSAGhTGr34W6n7Et',
  claimant: '0x0000000000000000000000000000000000000001' as const,
  challenge: 'DONALYZE-ABC123',
  expiresAt: Date.now() + 60_000,
}

describe('verification challenge tokens', () => {
  it('round-trips a signed payload', () => {
    expect(readChallenge(createChallenge(payload, 'secret'), 'secret')).toEqual(payload)
  })

  it('rejects a tampered token', () => {
    const token = createChallenge(payload, 'secret')
    expect(readChallenge(`${token}x`, 'secret')).toBeNull()
    expect(readChallenge(token, 'other-secret')).toBeNull()
  })

  it('generates a readable challenge code', () => {
    expect(newChallengeCode()).toMatch(/^DONALYZE-[A-F0-9]{6}$/)
  })
})
