import type {VercelRequest, VercelResponse} from '@vercel/node'

/**
 * Same-origin JSON-RPC proxy for Polkadot Hub TestNet (chain 420420417).
 *
 * Browsers often cannot reach the public RPC hosts directly (CORS, DNS or
 * network filtering surface as viem `NetworkError`), while server-side fetch
 * works fine. The frontend points a viem `http('/api/rpc')` transport here
 * and this handler forwards the exact JSON-RPC payload to the upstream RPCs,
 * trying each in order until one answers.
 */

const UPSTREAMS: string[] = (() => {
  const fromEnv = (process.env.PASSET_HUB_RPC_URLS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return fromEnv.length > 0
    ? fromEnv
    : [
        // Polkadot Hub TestNet (chain 420420417). The legacy Passet Hub
        // endpoint (chain 420420422) is retired and has been removed.
        'https://eth-rpc-testnet.polkadot.io/',
        'https://services.polkadothub-rpc.com/testnet',
      ]
})()

// Read-only methods only. Writes go through the connected wallet provider,
// never through this proxy.
const ALLOWED_METHODS = new Set([
  'web3_clientVersion',
  'net_version',
  'eth_chainId',
  'eth_blockNumber',
  'eth_getBalance',
  'eth_getCode',
  'eth_getTransactionCount',
  'eth_gasPrice',
  'eth_feeHistory',
  'eth_estimateGas',
  'eth_call',
  'eth_getLogs',
  'eth_getBlockByNumber',
  'eth_getBlockByHash',
  'eth_getTransactionByHash',
  'eth_getTransactionReceipt',
])

const UPSTREAM_TIMEOUT_MS = 15_000
const MAX_BODY_BYTES = 1_000_000

async function readJsonBody(req: VercelRequest): Promise<unknown> {
  const parsed = (req as {body?: unknown}).body
  if (parsed !== undefined && parsed !== null) {
    // Vercel pre-parses JSON bodies when Content-Type is application/json
    if (typeof parsed === 'string') {
      return JSON.parse(parsed)
    }
    return parsed
  }
  // Local dev (vite-plugin-api) passes the raw stream
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req as unknown as AsyncIterable<Uint8Array>) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buf.length
    if (size > MAX_BODY_BYTES) {
      throw Object.assign(new Error('Request body too large'), {status: 413})
    }
    chunks.push(buf)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  return text ? JSON.parse(text) : undefined
}

function getMethods(body: unknown): string[] {
  const envelopes = Array.isArray(body) ? body : [body]
  const methods: string[] = []
  for (const envelope of envelopes) {
    const method = (envelope as {method?: unknown} | null)?.method
    if (typeof method === 'string') {
      methods.push(method)
    } else {
      return []
    }
  }
  return methods
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ok: true})
  }

  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'})
  }

  try {
    const body = await readJsonBody(req)
    const methods = getMethods(body)
    if (methods.length === 0 || methods.some((m) => !ALLOWED_METHODS.has(m))) {
      return res.status(403).json({error: 'Method not allowed through RPC proxy'})
    }

    const payload = JSON.stringify(body)
    let lastError = 'No upstream RPC configured'

    for (const upstream of UPSTREAMS) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)
      try {
        const upstreamRes = await fetch(upstream, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: payload,
          signal: controller.signal,
        })
        const text = await upstreamRes.text()
        if (!upstreamRes.ok) {
          lastError = `Upstream ${upstream} HTTP ${upstreamRes.status}`
          continue
        }
        try {
          return res.status(200).json(JSON.parse(text))
        } catch {
          lastError = `Upstream ${upstream} returned non-JSON`
        }
      } catch (error) {
        lastError = error instanceof Error ? `${upstream}: ${error.message}` : String(error)
      } finally {
        clearTimeout(timer)
      }
    }

    return res.status(502).json({error: `All RPC upstreams unreachable. Last error: ${lastError}`})
  } catch (error) {
    const status = (error && typeof error === 'object' && 'status' in error)
      ? Number((error as {status: unknown}).status) || 500
      : 500
    return res.status(status).json({
      error: `RPC proxy failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
}
