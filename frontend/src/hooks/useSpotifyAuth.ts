import { useState, useEffect, useCallback } from 'react';

interface SpotifyProfile {
  id: string;
  displayName: string;
  email: string;
  country: string;
  product: string;
  followers: number;
  images: Array<{ url: string; height: number; width: number }>;
  uri: string;
}

interface SpotifyAuthState {
  sessionId: string | null;
  profile: SpotifyProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = 'http://localhost:5174/api';

export const useSpotifyAuth = () => {
  const [authState, setAuthState] = useState<SpotifyAuthState>({
    sessionId: null,
    profile: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  });

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('spotify_session_id');
    if (savedSessionId) {
      fetchProfile(savedSessionId);
    }
  }, []);

  // Handle OAuth callback
  const handleCallback = useCallback(async (code: string) => {
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
      const { sessionId } = data;

      localStorage.setItem('spotify_session_id', sessionId);
      await fetchProfile(sessionId);

      return sessionId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Fetch user profile
  const fetchProfile = async (sessionId: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/spotify/profile?sessionId=${sessionId}`
      );

      if (!response.ok) {
        localStorage.removeItem('spotify_session_id');
        throw new Error('Session expired');
      }

      const profile = await response.json();

      setAuthState({
        sessionId,
        profile,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState({
        sessionId: null,
        profile: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('spotify_session_id');
    localStorage.removeItem('spotify_auth_state');
    setAuthState({
      sessionId: null,
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
    handleCallback,
  };
};
