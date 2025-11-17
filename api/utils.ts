import fs from 'fs'
import type {SpotifyTrackResponse, TrackInfoResponse} from '../types'

/**
 * Validates that a string is a valid Spotify ID format
 * Spotify IDs are 22 alphanumeric characters (base62)
 * @param id - Potential Spotify ID
 * @returns True if valid format
 */
export function isValidSpotifyId(id: string): boolean {
  return /^[a-zA-Z0-9]{22}$/.test(id)
}

/**
 * Extracts artist ID from Spotify URL or validates if it's already an ID
 * @param artistUrl - Spotify artist URL or artist ID
 * @returns Artist ID or null if invalid
 */
export function extractArtistId(artistUrl: string): string | null {
  if (artistUrl.includes('open.spotify.com/artist/')) {
    const match = artistUrl.match(/artist\/([a-zA-Z0-9]+)/)
    if (match && isValidSpotifyId(match[1])) {
      return match[1]
    }
  } else if (isValidSpotifyId(artistUrl)) {
    // If it's not a full URL, validate it's a proper Spotify ID format
    return artistUrl
  }
  return null
}

/**
 * Extracts track ID from Spotify URI or URL
 * @param uri - Spotify track URI or URL
 * @returns Track ID or empty string if invalid
 */
export function extractTrackId(uri: string): string {
  if (uri.includes('open.spotify.com/track/')) {
    const match = uri.match(/track\/([a-zA-Z0-9]+)/)
    return match ? match[1] : ''
  }
  return ''
}

/**
 * Formats track data response from Spotify API to our API response format
 * Shared between /api/track endpoint and fetchTrackFromUri
 */
export function formatTrackResponse(trackData: SpotifyTrackResponse): TrackInfoResponse {
  return {
    artists: trackData.artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      url: artist.external_urls.spotify,
    })),
    previewUrl: trackData.preview_url,
  }
}

/**
 * Cleanup uploaded file from filesystem
 */
export function cleanupFile(filepath: string) {
  fs.promises.unlink(filepath).catch(() => {})
}

