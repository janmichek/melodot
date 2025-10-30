import { useState, useEffect } from "react";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { useReadContract, useAccount } from "wagmi";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3Auth,
} from "@web3auth/modal/react";
import { donateConfig } from "../generated";
import { passetHub, formatPasBalance, CURRENCY_SYMBOL } from "../wagmi-config";
import { Header } from "../components/Header";
import { ContractInfoFooter } from "../components/ContractInfoFooter";

export function Claim() {
  const [manualArtistId, setManualArtistId] = useState('');
  const [artistBalance, setArtistBalance] = useState<bigint | null>(null);
  const [artistClaimed, setArtistClaimed] = useState(false);
  const [providerReady, setProviderReady] = useState(false);

  // Web3Auth wallet connection
  const {
    connect,
    isConnected,
    loading: connectLoading,
  } = useWeb3AuthConnect();
  const {
    disconnect,
    loading: disconnectLoading,
  } = useWeb3AuthDisconnect();
  const { web3Auth } = useWeb3Auth();
  const { address } = useAccount();

  // Spotify auth hook
  const {
    isAuthenticated,
    profile,
    loading,
    error,
    login,
    logout,
    handleCallback,
  } = useSpotifyAuth();

  const contractAddress = donateConfig.address[passetHub.id];

  // Read artist balance from contract
  const { data: balanceData } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi,
    functionName: 'getArtistBalance',
    args: manualArtistId ? [manualArtistId] : undefined,
  });

  // Read artist claimed status from contract
  const { data: claimedData } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi,
    functionName: 'getArtistStatus',
    args: manualArtistId ? [manualArtistId] : undefined,
  });

  // Setup Web3Auth provider
  useEffect(() => {
    const verifyProviderReady = () => {
      if (web3Auth) {
        try {
          const isInitialized = web3Auth.status === "ready";
          const isNotConnecting = !connectLoading;
          const isReadyToLogin = isInitialized && isNotConnecting;
          setProviderReady(isReadyToLogin);
          return isReadyToLogin;
        } catch (error) {
          console.error("Error checking Web3Auth status:", error);
          setProviderReady(false);
        }
      } else {
        setProviderReady(false);
      }
      return false;
    };

    if (verifyProviderReady()) {
      return;
    }

    const interval = setInterval(() => {
      if (verifyProviderReady()) {
        clearInterval(interval);
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.warn("Web3Auth initialization timeout");
      setProviderReady(false);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [web3Auth, connectLoading]);

  // Update artist balance and claimed status
  useEffect(() => {
    // todo is the resigning needed? Can i use it directly from ?
    if (balanceData !== undefined) {
      setArtistBalance(balanceData as bigint);
    }
    if (claimedData !== undefined) {
      setArtistClaimed(claimedData as boolean);
    }
  }, [balanceData, claimedData]);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const savedState = localStorage.getItem('spotify_auth_state');

    if (code && state) {
      // Verify state matches (CSRF protection)
      if (state !== savedState) {
        console.error('State mismatch - possible CSRF attack');
        return;
      }

      // Handle the callback
      handleCallback(code)
        .then(() => {
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((error) => {
          console.error('OAuth callback error:', error);
        });
    }
  }, [handleCallback]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Spotify login error:', error);
    }
  };

  return (
    <div className="container">
      <Header
        isConnected={isConnected}
        address={address}
        onConnect={() => connect()}
        onDisconnect={() => disconnect()}
        connectLoading={connectLoading}
        disconnectLoading={disconnectLoading}
        providerReady={providerReady}
      />

      <main className="main-content">
        <div className="claim-container">
          <h1 style={{ marginBottom: '2rem' }}>Artist Claiming</h1>

          {/* Manual Artist ID Verification */}
          <div style={{
            border: '2px solid #1DB954',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem',
            backgroundColor: '#f0fff4'
          }}>
            <h2 style={{ marginBottom: '1rem', color: '#1DB954' }}>Manual Artist Verification</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Enter your Spotify Artist ID to check your balance and claim status
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Enter Spotify Artist ID (e.g., 1234567890)"
                value={manualArtistId}
                onChange={(e) => setManualArtistId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            {manualArtistId && (
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <h3>Artist Information</h3>
                <p><strong>Artist ID:</strong> {manualArtistId}</p>
                <p>



                  <strong>Balance:</strong>{' '}

                  <span style={{ fontSize: '1.2rem', color: '#1DB954', fontWeight: 'bold' }}>
                    {artistBalance !== null ? `${formatPasBalance(artistBalance)} ${CURRENCY_SYMBOL}` : 'Loading...'}
                  </span>
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span style={{
                    color: artistClaimed ? '#ff4444' : '#1DB954',
                    fontWeight: 'bold'
                  }}>
                    {artistClaimed ? '✓ Already Claimed' : '○ Available to Claim'}
                  </span>
                </p>

                {artistBalance === 0n && (
                  <p style={{ color: '#ff9800', marginTop: '1rem' }}>
                    ℹ️ No donations found for this artist ID
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Spotify Authentication */}
          <div style={{
            border: '2px solid #1DB954',
            borderRadius: '8px',
            padding: '2rem',
            backgroundColor: '#f9f9f9'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Spotify Authentication</h2>

            {!isAuthenticated ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                  Connect your Spotify account to view your profile information.
                </p>

                {error && (
                  <div style={{
                    color: 'red',
                    padding: '1rem',
                    marginBottom: '1rem',
                    border: '1px solid red',
                    borderRadius: '4px'
                  }}>
                    Error: {error}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    backgroundColor: '#1DB954',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Connecting...' : 'Connect with Spotify'}
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ marginBottom: '1.5rem' }}>Your Spotify Profile</h3>

                {profile && (
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    backgroundColor: '#fff'
                  }}>
                    {profile.images && profile.images.length > 0 && (
                      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <img
                          src={profile.images[0].url}
                          alt={profile.displayName}
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                    )}

                    <div style={{ lineHeight: '1.8', fontSize: '0.95rem' }}>
                      <p><strong>Display Name:</strong> {profile.displayName}</p>
                      <p><strong>Email:</strong> {profile.email}</p>
                      <p><strong>Country:</strong> {profile.country}</p>
                      <p><strong>Subscription:</strong> {profile.product}</p>
                      <p><strong>Followers:</strong> {profile.followers?.toLocaleString()}</p>
                      <p><strong>Spotify ID:</strong> {profile.id}</p>
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                      <button
                        onClick={logout}
                        style={{
                          padding: '0.5rem 1.5rem',
                          fontSize: '1rem',
                          backgroundColor: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '24px',
                          cursor: 'pointer',
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <ContractInfoFooter contractAddress={donateConfig.address[passetHub.id]} />
    </div>
  );
}
