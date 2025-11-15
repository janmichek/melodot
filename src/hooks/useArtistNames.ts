import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';

export interface ArtistInfo {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: { total: number };
  images: Array<{ url: string; height: number; width: number }>;
  external_urls: { spotify: string };
}

interface ArtistsMap {
  [artistId: string]: ArtistInfo;
}

/**
 * Fetches artist names from Spotify API for given artist IDs
 * Uses the Get Multiple Artists endpoint
 */
async function fetchArtistNames(artistIds: string[]): Promise<ArtistsMap> {
  if (artistIds.length === 0) {
    return {};
  }

  // Spotify API limit is 50 artists per request
  // Split into chunks if needed
  const chunks: string[][] = [];
  for (let i = 0; i < artistIds.length; i += 50) {
    chunks.push(artistIds.slice(i, i + 50));
  }

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const idsParam = chunk.join(',');
      const response = await fetch(`/api/artists?ids=${encodeURIComponent(idsParam)}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch artists: ${response.statusText}`);
        return {} as ArtistsMap;
      }
      
      return (await response.json()) as ArtistsMap;
    })
  );

  // Merge all results
  return results.reduce((acc, chunk) => ({ ...acc, ...chunk }), {});
}

/**
 * Hook to fetch and cache artist names by IDs
 * Returns a map of artistId -> ArtistInfo
 */
export function useArtistNames(artistIds: string[]) {
  // Memoize unique IDs to avoid unnecessary refetches
  const uniqueIds = useMemo(() => {
    return Array.from(new Set(artistIds.filter(Boolean)));
  }, [artistIds]);

  const { data, isLoading, error } = useQuery<ArtistsMap>({
    queryKey: ['artistNames', [...uniqueIds].sort().join(',')],
    queryFn: () => fetchArtistNames(uniqueIds),
    enabled: uniqueIds.length > 0,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });

  return {
    artistNames: data || {},
    isLoading,
    error,
  };
}

