/**
 * Centralized fetch utilities with error handling for all API endpoints
 */

import type {VercelResponse} from '@vercel/node'
import type {BioResponse, DiscoveryResult, ErrorWithStatus, SpotifyTrackResponse, TokenResponse} from '../types'
import {formatTrackResponse} from './utils.js'

/**
 * API endpoint URLs
 */
const API_URLS = {
  SPOTIFY_TOKEN: 'https://accounts.spotify.com/api/token',
  SPOTIFY_API_BASE: 'https://api.spotify.com/v1',
  RAPIDAPI_SPOTIFY_SCRAPER: 'https://spotify-scraper.p.rapidapi.com/v1',
  RAPIDAPI_SHAZAM: 'https://shazam-song-recognition-api.p.rapidapi.com',
} as const



/**
 * Fetches Spotify access token using client credentials
 */
export async function fetchSpotifyToken(): Promise<string> {
  const {clientId, clientSecret} = getSpotifyCredentials()
  const tokenData = await fetchJson<TokenResponse>(
    API_URLS.SPOTIFY_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    }
  )
  return tokenData.access_token
}

/**
 * Fetches artist information from Spotify API
 */
export async function fetchArtist(artistId: string, accessToken: string) {
  return fetchJson(
    `${API_URLS.SPOTIFY_API_BASE}/artists/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )
}

/**
 * Fetches multiple artists information from Spotify API
 * Accepts comma-separated artist IDs
 * Maximum 50 artist IDs (Spotify API limit)
 */
export async function fetchArtists(artistIds: string, accessToken: string) {
  return fetchJson(`${API_URLS.SPOTIFY_API_BASE}/artists?ids=${encodeURIComponent(artistIds)}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )
}

/**
 * Fetches track information from Spotify API
 */
export async function fetchTrack(trackId: string, accessToken: string) {
  return fetchJson(`${API_URLS.SPOTIFY_API_BASE}/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )
}

/**
 * Searches for tracks on Spotify
 */
export async function fetchSpotifySearch(searchQuery: string, accessToken: string) {
  const encodedQuery = encodeURIComponent(searchQuery)
  return fetchJson(`${API_URLS.SPOTIFY_API_BASE}/search?q=${encodedQuery}&type=track&limit=1`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )
}

/**
 * Fetches artist biography from RapidAPI Spotify Scraper
 */
export async function fetchBio(artistId: string): Promise<BioResponse> {
  return fetchJson<BioResponse>(`${API_URLS.RAPIDAPI_SPOTIFY_SCRAPER}/artist/overview?artistId=${encodeURIComponent(artistId)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'spotify-scraper.p.rapidapi.com',
        'x-rapidapi-key': getRapidApiKey(),
      },
    }
  )
}

/**
 * Fetches audio recognition from Shazam API
 */
export async function fetchDiscovery(fileBuffer: Buffer): Promise<DiscoveryResult> {
  return fetchJson<DiscoveryResult>(`${API_URLS.RAPIDAPI_SHAZAM}/recognize/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-RapidAPI-Key': getRapidApiKey(),
        'X-RapidAPI-Host': 'shazam-song-recognition-api.p.rapidapi.com',
      },
      body: fileBuffer,
    }
  )
}

/**
 * Fetches track info from Spotify track URI
 * Handles spotify:track:TRACK_ID format from Shazam API
 * This is a utility function used internally by the discover endpoint
 * to enrich discovery results with Spotify track information
 */
export async function fetchTrackFromUri(spotifyUri: string, accessToken: string): Promise<DiscoveryResult['spotifyInfo']> {
  try {
    if (!spotifyUri.startsWith('spotify:track:')) {
      return null
    }

    const trackId = spotifyUri.replace('spotify:track:', '')
    const trackData = await fetchTrack(trackId, accessToken) as SpotifyTrackResponse
    const trackInfo = formatTrackResponse(trackData)

    return {
      artists: trackInfo.artists,
      previewUrl: trackInfo.previewUrl ?? null,
    }
  } catch {
    return null
  }
}

/**
 * Fetches and parses JSON response with error handling
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      const text = await response.text()
      const error: ErrorWithStatus = new Error(`${response.statusText}: ${text}`)
      error.status = response.status
      throw error
    }
    return await response.json() as T
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error) {
      throw error
    }
    throw new Error(`Fetch failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Handles successful API responses with consistent formatting
 * Returns JSON response with 200 status code
 */
export function handleApiSuccess(res: VercelResponse, data: unknown): VercelResponse {
  return res.status(200).json(data)
}

/**
 * Handles errors in API endpoints with consistent formatting
 * Extracts status code from error if available, defaults to 500
 */
export function handleApiError(res: VercelResponse, error: unknown, context: string): VercelResponse {
  const status = (error && typeof error === 'object' && 'status' in error) 
    ? (error as ErrorWithStatus).status ?? 500 
    : 500
  return res.status(status).json({
    error: `${context}: ${error instanceof Error ? error.message : 'Unknown error'}`,
  })
}


/**
 * Gets RapidAPI key from environment variable
 * Throws error if not configured
 */
function getRapidApiKey(): string {
  const apiKey = process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY
  if (!apiKey) {
    throw new Error('RapidAPI key not configured')
  }
  return apiKey
}

/**
 * Gets Spotify credentials from environment variables
 * Throws error if not configured
 */
function getSpotifyCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Spotify API not configured')
  }
  return {clientId, clientSecret}
}

