import type {Plugin} from 'vite'
import type {IncomingMessage, ServerResponse} from 'http'
import {resolve} from 'path'

/**
 * Vite plugin to handle API routes during development
 * This allows /api/* routes to work without needing vercel dev
 * 
 * The plugin intercepts /api/* requests and runs the serverless function locally,
 * properly handling multipart/form-data for file uploads.
 */
export function apiPlugin(): Plugin {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        // Only handle /api/* routes
        if (!req.url?.startsWith('/api/')) {
          return next()
        }

        // Handle CORS preflight
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.writeHead(200)
          res.end()
          return
        }

        // Handle HEAD requests - just return 200 to indicate API is available
        if (req.method === 'HEAD') {
          res.writeHead(200)
          res.end()
          return
        }

        try {
          // Import the API handler using Vite's SSR module loader
          // This properly handles TypeScript files in the dev server context
          // Extract the path after /api/ and map to the correct file
          const urlPath = req.url.split('?')[0] // Remove query string
          const apiRoute = urlPath.replace('/api/', '') // e.g., 'discover' or 'spotify/track/info'

          // Map route to file path (endpoints subdirectory)
          // /api/discover -> api/endpoints/discover.ts
          // /api/track -> api/endpoints/track.ts
          // /api/verify -> api/endpoints/verify.ts
          // /api/artist -> api/endpoints/artist.ts
          // /api/artists -> api/endpoints/artists.ts
          let apiFilePath: string
          if (apiRoute === 'discover') {
            apiFilePath = resolve(process.cwd(), 'api', 'endpoints', 'discover.ts')
          } else if (apiRoute === 'track') {
            apiFilePath = resolve(process.cwd(), 'api', 'endpoints', 'track.ts')
          } else if (apiRoute === 'verify') {
            apiFilePath = resolve(process.cwd(), 'api', 'endpoints', 'verify.ts')
          } else if (apiRoute === 'artist') {
            apiFilePath = resolve(process.cwd(), 'api', 'endpoints', 'artist.ts')
          } else if (apiRoute === 'artists') {
            apiFilePath = resolve(process.cwd(), 'api', 'endpoints', 'artists.ts')
          } else if (apiRoute === 'rpc') {
            apiFilePath = resolve(process.cwd(), 'api', 'endpoints', 'rpc.ts')
          } else {
            // Unknown route
            res.writeHead(404, {'Content-Type': 'application/json'})
            res.write(JSON.stringify({error: 'API endpoint not found'}))
            res.end()
            return
          }

          const handlerModule = await server.ssrLoadModule(apiFilePath)
          const handler = handlerModule.default || handlerModule

          // Parse query parameters from URL
          const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
          const query: Record<string, string | string[]> = {}
          url.searchParams.forEach((value, key) => {
            if (query[key]) {
              // Multiple values for same key
              if (Array.isArray(query[key])) {
                (query[key] as string[]).push(value)
              } else {
                query[key] = [query[key] as string, value]
              }
            } else {
              query[key] = value
            }
          })

          // Create a mock Vercel request that formidable can parse
          // Formidable needs the raw request stream with EventEmitter methods (on, once, etc.)
          // We need to preserve the original req object's prototype to keep all methods
          const vercelReq = Object.assign(req, {
            // Override specific properties while keeping all methods from IncomingMessage
            method: req.method || 'GET',
            url: req.url,
            headers: req.headers || {},
            query, // Add parsed query parameters
          }) as unknown

          // Create a mock Vercel response
          let responseBody: string | undefined
          let statusCode = 200
          const responseHeaders: Record<string, string> = {}

          interface MockVercelResponse {
            statusCode: number
            status: (code: number) => MockVercelResponse
            json: (data: unknown) => MockVercelResponse
            setHeader: (name: string, value: string) => MockVercelResponse
            end: () => void
          }

          const vercelRes: MockVercelResponse = {
            statusCode: 200,
            status: function(code: number) {
              statusCode = code
              this.statusCode = code
              return this
            },
            json: function(data: unknown) {
              responseBody = JSON.stringify(data)
              this.setHeader('Content-Type', 'application/json')
              return this
            },
            setHeader: function(name: string, value: string) {
              responseHeaders[name.toLowerCase()] = value
              return this
            },
            end: function() {
              // Response handled below
            },
          }

          // Call the handler with the request stream intact
          await handler(vercelReq, vercelRes as unknown as Parameters<typeof handler>[1])

          // Send response back to client
          res.writeHead(statusCode, {
            ...responseHeaders,
            'Content-Type': responseHeaders['content-type'] || 'application/json',
          })
          
          if (responseBody) {
            res.write(responseBody)
          }
          res.end()

        } catch (error) {
          console.error('API route error:', error)
          res.writeHead(500, {'Content-Type': 'application/json'})
          res.write(JSON.stringify({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error',
          }))
          res.end()
        }
      })
    },
  }
}

