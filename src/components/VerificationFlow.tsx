import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";

interface VerificationFlowProps {
  artistId: string;
  isVerified: boolean;
  isVerifying: boolean;
  verifyError: string | null;
  onVerify: () => void;
}

export function VerificationFlow({
  artistId,
  isVerified,
  isVerifying,
  verifyError,
  onVerify,
}: VerificationFlowProps) {
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  useEffect(() => {
    if (isCodeCopied) {
      const timer = setTimeout(() => setIsCodeCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCodeCopied]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText('#8');
      setIsCodeCopied(true);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Verification Instructions */}
      {!isVerified && (
        <div className="rounded-lg border border-border/40 bg-muted/10 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Verification Instructions</h4>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>
              Copy this code:{' '}
              <code className="px-2 py-1 rounded bg-background border border-border font-mono text-foreground">#8</code>
              {' '}
              <button
                onClick={handleCopyCode}
                className="px-2 py-1 text-xs rounded border border-border hover:bg-muted transition-colors"
                title="Copy code"
              >
                {isCodeCopied ? '✓ Copied' : '📋 Copy'}
              </button>
            </li>
            <li>
              Go to your{' '}
              <a
                href={`https://artists.spotify.com/c/artist/${artistId}/profile/about`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Spotify artist profile
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" x2="21" y1="14" y2="3" />
                </svg>
              </a>
            </li>
            <li>Paste the code to your artist bio's about section</li>
            <li>Come back and click 'Verify' below</li>
          </ol>
        </div>
      )}

      {/* Verification Status */}
      {isVerified && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-500"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-sm font-semibold text-emerald-600">
              Verification successful! You can now claim your artist balance.
            </span>
          </div>
        </div>
      )}

      {/* Verify Button */}
      {!isVerified && (
        <Button
          onClick={onVerify}
          disabled={isVerifying || !artistId}
          className="w-full"
          variant="default"
        >
          {isVerifying ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Verifying...
            </>
          ) : (
            'Verify Bio'
          )}
        </Button>
      )}

      {/* Verify Error */}
      {verifyError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {verifyError}
        </div>
      )}
    </div>
  );
}

