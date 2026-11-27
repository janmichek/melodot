// @vitest-environment node
import {describe, expect, it, vi, beforeEach} from 'vitest'
import {rateLimit, resetRateLimitForTests} from './rateLimit'

function mockReq(ip: string) {
  return {headers: {'x-forwarded-for': ip}} as never
}

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    setHeader(name: string, value: string) {
      this.headers[name] = value
      return this
    },
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(body: unknown) {
      this.body = body
      return this
    },
  }
  return res
}

describe('rateLimit', () => {
  beforeEach(() => resetRateLimitForTests())

  it('allows requests under the limit and blocks the next one', () => {
    const options = {key: 'test', limit: 2, windowMs: 60_000}
    expect(rateLimit(mockReq('1.1.1.1') as never, mockRes() as never, options)).toBe(true)
    expect(rateLimit(mockReq('1.1.1.1') as never, mockRes() as never, options)).toBe(true)

    const blocked = mockRes()
    expect(rateLimit(mockReq('1.1.1.1') as never, blocked as never, options)).toBe(false)
    expect(blocked.statusCode).toBe(429)
    expect(blocked.headers['Retry-After']).toBeDefined()
  })

  it('keeps separate buckets per IP', () => {
    const options = {key: 'test', limit: 1, windowMs: 60_000}
    expect(rateLimit(mockReq('1.1.1.1') as never, mockRes() as never, options)).toBe(true)
    expect(rateLimit(mockReq('2.2.2.2') as never, mockRes() as never, options)).toBe(true)
  })

  it('resets after the window', () => {
    vi.useFakeTimers()
    const options = {key: 'test', limit: 1, windowMs: 1_000}
    expect(rateLimit(mockReq('1.1.1.1') as never, mockRes() as never, options)).toBe(true)
    vi.advanceTimersByTime(1_001)
    expect(rateLimit(mockReq('1.1.1.1') as never, mockRes() as never, options)).toBe(true)
    vi.useRealTimers()
  })
})
