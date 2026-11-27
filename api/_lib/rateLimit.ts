import type {VercelRequest, VercelResponse} from '@vercel/node'

/**
 * Best-effort per-instance rate limiter. Vercel may run several instances, so
 * this is a burst guard, not a distributed quota. Use Vercel WAF or Upstash
 * for a hard global limit.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 5_000

function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded
  return first?.split(',')[0]?.trim() || req.headers['x-real-ip']?.toString() || 'unknown'
}

export interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
}

export function rateLimit(req: VercelRequest, res: VercelResponse, options: RateLimitOptions): boolean {
  const now = Date.now()
  const bucketKey = `${options.key}:${clientIp(req)}`
  const existing = buckets.get(bucketKey)

  if (!existing || now >= existing.resetAt) {
    buckets.set(bucketKey, {count: 1, resetAt: now + options.windowMs})
  } else if (existing.count >= options.limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    res.setHeader('Retry-After', String(retryAfter))
    res.setHeader('X-RateLimit-Limit', String(options.limit))
    res.setHeader('X-RateLimit-Remaining', '0')
    res.status(429).json({error: 'Too many requests. Please retry shortly.'})
    return false
  } else {
    existing.count += 1
  }

  if (buckets.size > MAX_BUCKETS) {
    for (const [key, bucket] of buckets) {
      if (now >= bucket.resetAt) {buckets.delete(key)}
    }
  }

  const bucket = buckets.get(bucketKey)
  res.setHeader('X-RateLimit-Limit', String(options.limit))
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, options.limit - (bucket?.count ?? 1))))
  return true
}

export function resetRateLimitForTests() {
  buckets.clear()
}
