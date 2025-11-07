import {useEffect} from "react";
import {useSpotifyAuth} from "../hooks/useSpotifyAuth";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

export function ClaimSpotifyCard() {
  const { isAuthenticated, profile, loading, error, login, logout, callback } = useSpotifyAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const savedState = localStorage.getItem('spotify_auth_state');

    if (code && state) {
      if (state !== savedState) {
        console.error('State mismatch - possible CSRF attack');
        return;
      }

      callback(code)
        .then(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(() => {
          console.error('OAuth callback error:');
        });
    }
  }, [callback]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Spotify login error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spotify Authentication</CardTitle>
        {!isAuthenticated && (
          <CardDescription>
            Connect your Spotify account to view your profile information.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!isAuthenticated ? (
          <div className="claim-spotify-auth-content">
            {error && (
              <div className="text-red-500">
                Error: {error}
              </div>
            )}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="claim-spotify-button mt-4"
            >
              {loading ? 'Connecting...' : 'Connect with Spotify'}
            </Button>
          </div>
        ) : (
          <div>
            <h3 className="font-bold mb-4">Your Spotify Profile</h3>
            {profile && (
              <div className="flex items-center space-x-4">
                {profile.images && profile.images.length > 0 && (
                  <img
                    src={profile.images[0].url}
                    alt={profile.displayName}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div className="claim-profile-details">
                  <p><strong>Display Name:</strong> {profile.displayName}</p>
                  <p><strong>Country:</strong> {profile.country}</p>
                  <p><strong>Followers:</strong> {profile.followers?.toLocaleString()}</p>
                  <p><strong>Spotify ID:</strong> {profile.id}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {isAuthenticated && (
        <CardFooter>
          <Button
            onClick={logout}
            className="claim-logout-button"
            variant="outline"
          >
            Logout
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
