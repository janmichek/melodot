import { useState, useEffect } from "react";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Layout, useWeb3AuthContext } from "../components/Layout";
import { donateConfig } from "../generated";
import { formatPasBalance, CURRENCY_SYMBOL } from "../wagmi-config";
import type { Abi } from "viem";
import { isAddress } from "viem";

export function Claim() {
  const { isConnected, connect, contractAddress, providerReady } = useWeb3AuthContext();
  const [manualArtistId, setManualArtistId] = useState('');
  const [artistBalance, setArtistBalance] = useState<bigint | null>(null);
  const [artistClaimed, setArtistClaimed] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

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

  const { writeContract: withdrawWriteContract, isPending: isWithdrawPending } = useWriteContract();
  const { data: claimHash } = useWaitForTransactionReceipt({ hash: undefined as any });

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

  // Handle withdraw donation
  const handleWithdraw = async () => {
    if (!manualArtistId) {
      setWithdrawError('Please select an artist first');
      return;
    }

    if (!withdrawAddress || !isAddress(withdrawAddress as `0x${string}`)) {
      setWithdrawError('Invalid recipient address');
      return;
    }

    if (!contractAddress) {
      setWithdrawError('Contract address not found');
      return;
    }

    setIsWithdrawing(true);
    setWithdrawError(null);

    try {
      withdrawWriteContract({
        address: contractAddress,
        abi: donateConfig.abi as Abi,
        functionName: 'withdrawDonate',
        args: [manualArtistId, withdrawAddress as `0x${string}`],
        gas: BigInt(300000), // Fixed gas limit to avoid gas estimation issues
      });
    } catch (error: any) {
      setWithdrawError(error?.message || 'Failed to withdraw');
      setIsWithdrawing(false);
    }
  };

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
    <Layout>
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

                {/* Claim Button - Show only if available to claim and has balance */}
                {!artistClaimed && artistBalance !== null && artistBalance > 0n && isConnected && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <button
                      onClick={handleClaimArtist}
                      disabled={isClaiming || isClaimPending}
                      style={{
                        padding: '0.75rem 2rem',
                        fontSize: '1rem',
                        backgroundColor: '#1DB954',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isClaiming || isClaimPending ? 'not-allowed' : 'pointer',
                        opacity: isClaiming || isClaimPending ? 0.6 : 1,
                        fontWeight: 'bold'
                      }}
                    >
                      {isClaiming || isClaimPending ? 'Claiming...' : 'Claim Artist Balance'}
                    </button>
                    {claimError && (
                      <div style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        {claimError}
                      </div>
                    )}
                  </div>
                )}

                {!isConnected && !artistClaimed && artistBalance !== null && artistBalance > 0n && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    color: '#856404'
                  }}>
                    ⚠️ Connect your wallet to claim this artist balance
                  </div>
                )}

                {/* Withdraw Interface - Show only if already claimed */}
                {artistClaimed && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#e8f5e9',
                    border: '2px solid #4CAF50',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ color: '#2e7d32', marginTop: 0 }}>Withdraw Claimed Balance</h4>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>
                      Send your claimed balance to a wallet address
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                      <input
                        type="text"
                        placeholder="Enter recipient address (0x...)"
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        style={{
                          padding: '0.75rem',
                          fontSize: '0.9rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <button
                        onClick={handleWithdraw}
                        disabled={!isConnected || !isAddress(withdrawAddress as `0x${string}`) || isWithdrawing || isWithdrawPending}
                        style={{
                          padding: '0.75rem 2rem',
                          fontSize: '1rem',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: !isConnected || !isAddress(withdrawAddress as `0x${string}`) || isWithdrawing || isWithdrawPending ? 'not-allowed' : 'pointer',
                          opacity: !isConnected || !isAddress(withdrawAddress as `0x${string}`) || isWithdrawing || isWithdrawPending ? 0.6 : 1,
                          fontWeight: 'bold'
                        }}
                      >
                        {isWithdrawing || isWithdrawPending ? 'Withdrawing...' : 'Withdraw All'}
                      </button>
                      {withdrawError && (
                        <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                          {withdrawError}
                        </div>
                      )}
                      {!isAddress(withdrawAddress as `0x${string}`) && withdrawAddress && (
                        <p style={{ color: '#d32f2f', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                          ❌ Invalid address
                        </p>
                      )}
                    </div>
                  </div>
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
    </Layout>
  );
}
