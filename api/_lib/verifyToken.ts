import {createHmac, randomBytes, timingSafeEqual} from 'node:crypto'

export interface ChallengePayload {
  artistId: string
  claimant: `0x${string}`
  challenge: string
  expiresAt: number
}

function base64url(value: Buffer | string): string {
  return Buffer.from(value).toString('base64url')
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createChallenge(payload: ChallengePayload, secret: string): string {
  const body = base64url(JSON.stringify(payload))
  return `${body}.${sign(body, secret)}`
}

export function readChallenge(token: string, secret: string): ChallengePayload | null {
  const [body, signature] = token.split('.')
  if (!body || !signature) {return null}

  const expected = sign(body, secret)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as ChallengePayload
    if (
      typeof payload.artistId !== 'string' ||
      typeof payload.claimant !== 'string' ||
      typeof payload.challenge !== 'string' ||
      typeof payload.expiresAt !== 'number'
    ) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function newChallengeCode(): string {
  return `DONALYZE-${randomBytes(3).toString('hex').toUpperCase()}`
}
