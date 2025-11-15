import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Check, Copy, ExternalLink, Loader2} from "lucide-react";

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
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-border hover:bg-muted transition-colors"
                title="Copy code"
              >
                {isCodeCopied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
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
                <ExternalLink className="h-3.5 w-3.5" />
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
            <Check className="h-5 w-5 text-emerald-500" />
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
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
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

