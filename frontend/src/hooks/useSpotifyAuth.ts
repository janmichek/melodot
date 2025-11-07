import { useState, useEffect, useCallback } from 'react';

interface SpotifyProfile {
  id: string;
  displayName: string;
  country: string;
  followers: number;
  images: Array<{ url: string; height: number; width: number }>;
  uri: string;
}

interface SpotifyAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  profile: SpotifyProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = '/api';

export const useSpotifyAuth = () => {
  const [authState, setAuthState] = useState<SpotifyAuthState>({
    accessToken: null,
    refreshToken: null,
    profile: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  });

  // Load tokens from localStorage on mount
  useEffect(() => {
    const savedAccessToken = localStorage.getItem('spotify_access_token');
    if (savedAccessToken) {
      fetchProfile(savedAccessToken);
    }
  }, []);

  // Start OAuth login
  const login = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/spotify/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to start authentication');
      }

      const data = await response.json();
      const { authUrl, state } = data;

      localStorage.setItem('spotify_auth_state', state);
      window.location.href = authUrl;
    } catch (error) {

      // todo separate erro messagging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Handle OAuth callback
  async function callback(code: string) {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/spotify/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      const { accessToken, refreshToken } = data;

      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken);
      await fetchProfile(accessToken);

      return accessToken;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }

  // Fetch user profile
  const fetchProfile = async (accessToken: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/spotify/profile?accessToken=${accessToken}`
      );

      if (!response.ok) {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        throw new Error('Token expired or invalid');
      }

      const profile = await response.json();

      setAuthState({
        accessToken,
        refreshToken: localStorage.getItem('spotify_refresh_token'),
        profile,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState({
        accessToken: null,
        refreshToken: null,
        profile: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  };



  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_auth_state');
    setAuthState({
      accessToken: null,
      refreshToken: null,
      profile: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...authState,
    login,
    logout,
    callback,
  };
};
