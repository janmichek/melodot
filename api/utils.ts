import fs from 'fs';
import type { SpotifyTrackInfo } from './types';

/**
 * Extracts artist ID from Spotify URL or returns the input if it's already an ID
 * @param artistUrl - Spotify artist URL or artist ID
 * @returns Artist ID or null if invalid
 */
export function extractArtistId(artistUrl: string): string | null {
  if (artistUrl.includes('open.spotify.com/artist/')) {
    const match = artistUrl.match(/artist\/([a-zA-Z0-9]+)/);
    if (match) {
      return match[1];
    }
  } else {
    // If it's not a full URL, assume it's already an artist ID
    return artistUrl;
  }
  return null;
}

/**
 * Extracts track ID from Spotify URI or URL
 * @param uri - Spotify track URI or URL
 * @returns Track ID or empty string if invalid
 */
export function extractTrackId(uri: string): string {
    if (uri.includes('open.spotify.com/track/')) {
    const match = uri.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  }
  return '';
}

/**
 * Formats track data response
 */
export function formatTrackResponse(trackData: SpotifyTrackInfo) {
  return {
    id: trackData.id,
    name: trackData.name,
    artists: trackData.artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      url: artist.external_urls.spotify,
    })),
    album: {
      id: trackData.album.id,
      name: trackData.album.name,
      releaseDate: trackData.album.release_date,
      coverUrl: trackData.album.images[0]?.url,
      url: trackData.album.external_urls.spotify,
    },
    durationMs: trackData.duration_ms,
    popularity: trackData.popularity,
    previewUrl: trackData.preview_url,
    url: trackData.external_urls.spotify,
  };
}



/**
 * Cleanup uploaded file from filesystem
 */
export function cleanupFile(filepath: string) {
  fs.promises.unlink(filepath).catch(() => {});
}

