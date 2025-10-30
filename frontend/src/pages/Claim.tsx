import { useState, useEffect } from "react";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { useReadContract, useWriteContract } from "wagmi";
import { Layout, useWeb3AuthContext } from "../components/Layout";
import { donateConfig } from "../generated";
import { formatPasBalance, CURRENCY_SYMBOL } from "../wagmi-config";
import { ArtistWithdrawForm } from "../components/ArtistWithdrawForm";
import type { Abi } from "viem";

export function Claim() {
  const { isConnected, connect, contractAddress, providerReady } = useWeb3AuthContext();
  const [manualArtistId, setManualArtistId] = useState('');
  const [artistBalance, setArtistBalance] = useState<bigint | null>(null);
  const [artistClaimed, setArtistClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

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

  // Read artist balance from contract
  const { data: balanceData } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: 'getArtistBalance',
    args: manualArtistId ? [manualArtistId] : undefined,
  });

  // Read artist claimed status from contract
  const { data: claimedData } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: 'getArtistStatus',
    args: manualArtistId ? [manualArtistId] : undefined,
  });

  const {
    writeContract: claimWriteContract,
    isPending: isClaimPending
  } = useWriteContract();


  const handleClaimArtist = async () => {
    if (!manualArtistId || !contractAddress) {
      setClaimError('Artist ID is required');
      return;
    }

    setIsClaiming(true);
    setClaimError(null);

    try {
      await claimWriteContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: 'claimArtist',
        args: [manualArtistId],
        gas: BigInt(300000),
        // Fixed gas limit to avoid gas estimation issues
      });
    } catch (error: any) {
      setClaimError(error?.message || 'Failed to claim artist');
      setIsClaiming(false);
    }
  };


  // Update artist balance and claimed status
  useEffect(() => {
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
    <Layout>
      <div className="claim-container">
          <h1 className="claim-page-title">Artist Claiming</h1>

          {/* Manual Artist ID Verification */}
          <div className="claim-section claim-artist-section">
            <h2>Manual Artist Verification</h2>
            <p className="claim-section-description">
              Enter your Spotify Artist ID to check your balance and claim status
            </p>

            <div className="claim-artist-input-group">
              <input
                type="text"
                placeholder="Enter Spotify Artist ID (e.g., 1234567890)"
                value={manualArtistId}
                onChange={(e) => setManualArtistId(e.target.value)}
                className="claim-artist-input"
              />
            </div>

            {manualArtistId && (
              <div className="claim-artist-info-box">
                <h3>Artist Information</h3>
                <p><strong>Artist ID:</strong> {manualArtistId}</p>
                <p>
                  <strong>Balance:</strong>{' '}
                  <span className="claim-artist-balance">
                    {artistBalance !== null ? `${formatPasBalance(artistBalance)} ${CURRENCY_SYMBOL}` : 'Loading...'}
                  </span>
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`claim-artist-status ${artistClaimed ? 'claimed' : 'available'}`}>
                    {artistClaimed ? '✓ Already Claimed' : '○ Available to Claim'}
                  </span>
                </p>

                {artistBalance === 0n && (
                  <p className="claim-no-balance-message">
                    ℹ️ No donations found for this artist ID
                  </p>
                )}

                {/* Claim Button - Show only if available to claim and has balance */}
                {!artistClaimed && artistBalance !== null && artistBalance > 0n && isConnected && (
                  <div className="claim-action-section">
                    <button
                      onClick={handleClaimArtist}
                      disabled={isClaiming || isClaimPending}
                      className="claim-button"
                    >
                      {isClaiming || isClaimPending ? 'Claiming...' : 'Claim Artist Balance'}
                    </button>
                    {claimError && (
                      <div className="claim-error-message">
                        {claimError}
                      </div>
                    )}
                  </div>
                )}

                {!isConnected && !artistClaimed && artistBalance !== null && artistBalance > 0n && (
                  <div className="claim-wallet-warning">
                    ⚠️ Connect your wallet to claim this artist balance
                  </div>
                )}

                {/* Withdraw Interface - Show only if already claimed */}
                {artistClaimed && contractAddress && manualArtistId && (
                  <ArtistWithdrawForm
                    contractAddress={contractAddress}
                    artistId={manualArtistId}
                  />
                )}
              </div>
            )}
          </div>

          {/* Spotify Authentication */}
          <div className="claim-section claim-spotify-section">
            <h2>Spotify Authentication</h2>

            {!isAuthenticated ? (
              <div className="claim-spotify-auth-content">
                <p className="claim-spotify-auth-description">
                  Connect your Spotify account to view your profile information.
                </p>

                {error && (
                  <div className="claim-spotify-error">
                    Error: {error}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="claim-spotify-button"
                >
                  {loading ? 'Connecting...' : 'Connect with Spotify'}
                </button>
              </div>
            ) : (
              <div>
                <h3 className="claim-profile-section">Your Spotify Profile</h3>

                {profile && (
                  <div className="claim-profile-card">
                    {profile.images && profile.images.length > 0 && (
                      <div className="claim-profile-image-container">
                        <img
                          src={profile.images[0].url}
                          alt={profile.displayName}
                          className="claim-profile-image"
                        />
                      </div>
                    )}

                    <div className="claim-profile-details">
                      <p><strong>Display Name:</strong> {profile.displayName}</p>
                      <p><strong>Country:</strong> {profile.country}</p>
                      <p><strong>Followers:</strong> {profile.followers?.toLocaleString()}</p>
                      <p><strong>Spotify ID:</strong> {profile.id}</p>
                    </div>

                    <div className="claim-profile-actions">
                      <button
                        onClick={logout}
                        className="claim-logout-button"
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
    </Layout>
  );
}
