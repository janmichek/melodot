/**
 * Centralized fetch utilities with error handling for all API endpoints
 */

import type { ErrorWithStatus, TokenResponse } from './types';

/**
 * Gets RapidAPI key from environment variable
 * Throws error if not configured
 */
export function getRapidApiKey(): string {
  const apiKey = process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY;
  if (!apiKey) {
    throw new Error('RapidAPI key not configured');
  }
  return apiKey;
}

// Lazy-load apiKey to avoid throwing error at module load time
let _apiKey: string | null = null;
export function getApiKey(): string {
  if (!_apiKey) {
    _apiKey = getRapidApiKey();
  }
  return _apiKey;
}

/**
 * Gets Spotify credentials from environment variables
 * Throws error if not configured
 */
function getSpotifyCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Spotify API not configured');
  }
  return { clientId, clientSecret };
}

const { clientId, clientSecret } = getSpotifyCredentials();
export { clientId, clientSecret };

/**
 * Safely fetches from a URL with error handling
 */
async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error: ErrorWithStatus = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  return response;
}

/**
 * Fetches and parses JSON response with error handling
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const text = await response.text();
      const error: ErrorWithStatus = new Error(`${response.statusText}: ${text}`);
      error.status = response.status;
      throw error;
    }
    return await response.json() as T;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }
    throw new Error(`Fetch failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches Spotify access token using client credentials
 */
export async function fetchSpotifyToken(): Promise<string> {
  const tokenData = await fetchJson<TokenResponse>(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    }
  );
  return tokenData.access_token;
}

/**
 * Fetches data from Spotify API with Bearer token
 */
export async function fetchSpotifyApi<T>(endpoint: string, accessToken: string, options?: RequestInit): Promise<T> {
  return fetchJson<T>(endpoint, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
}

/**
 * Fetches user profile from Spotify API
 */
export async function fetchSpotifyProfile(accessToken: string) {
  return fetchSpotifyApi<import('./types').SpotifyProfile>('https://api.spotify.com/v1/me', accessToken);
}

/**
 * Fetches artist information from Spotify API
 */
export async function fetchSpotifyArtist(artistId: string, accessToken: string) {
  return fetchSpotifyApi(`https://api.spotify.com/v1/artists/${artistId}`, accessToken);
}

/**
 * Fetches track information from Spotify API
 */
export async function fetchSpotifyTrack(trackId: string, accessToken: string) {
  return fetchSpotifyApi(`https://api.spotify.com/v1/tracks/${trackId}`, accessToken);
}

/**
 * Searches for tracks on Spotify
 */
export async function fetchSpotifySearch(searchQuery: string, accessToken: string) {
  const encodedQuery = encodeURIComponent(searchQuery);
  return fetchSpotifyApi(
    `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=1`,
    accessToken
  );
}

/**
 * Fetches artist biography from RapidAPI Spotify Scraper
 */
export async function fetchRapidApiBiography(artistId: string): Promise<any> {
  return fetchJson(
    `https://spotify-scraper.p.rapidapi.com/v1/artist/overview?artistId=${encodeURIComponent(artistId)}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'spotify-scraper.p.rapidapi.com',
        'x-rapidapi-key': getApiKey(),
      },
    }
  );
}

/**
 * Fetches audio recognition from Shazam API
 */
export async function fetchShazamRecognition(fileBuffer: Buffer): Promise<any> {
  return fetchJson(
    'https://shazam-song-recognition-api.p.rapidapi.com/recognize/file',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-RapidAPI-Key': getApiKey(),
        'X-RapidAPI-Host': 'shazam-song-recognition-api.p.rapidapi.com',
      },
      body: fileBuffer as any,
    }
  );
}

/**
 * Fetches track info from internal Spotify service
 */
export async function fetchInternalTrackInfo(spotifyUri: string): Promise<any | null> {
  const serviceUrl = process.env.SPOTIFY_SERVICE_URL ?? 'http://localhost:5173';
  try {
    const response = await fetch(`${serviceUrl}/api/track?uri=${encodeURIComponent(spotifyUri)}`);
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}
