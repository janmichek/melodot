/**
 * Shared types for API endpoints
 */

export interface ErrorWithStatus extends Error {
  status?: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RapidApiResponse {
  status: boolean;
  errorId?: string;
  biography?: string;
  description?: string;
  about?: string;
  artist?: {
    biography?: string;
    description?: string;
    about?: string;
    [key: string]: any;
  };
  data?: {
    biography?: string;
    description?: string;
    about?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface SpotifyArtistInfo {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrackInfo {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }>;
  album: {
    id: string;
    name: string;
    release_date: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    external_urls: {
      spotify: string;
    };
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrackInfo[];
  };
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  country: string;
  product: string;
  followers?: {
    total: number;
  };
  images?: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
  uri: string;
  external_urls: {
    spotify: string;
    [key: string]: string;
  };
}

