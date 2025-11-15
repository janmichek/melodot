import {Check, Loader2, Lock} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {AddressInput} from "@/components/ui/address-input";
import {VerificationFlow} from "@/components/VerificationFlow";
import {ClaimFlow} from "@/components/ClaimFlow";
import {ArtistWithdrawForm} from "@/components/ArtistWithdrawForm";
import {ArtistInfo} from "@/components/ArtistInfo";

interface ArtistData {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

interface ClaimGuideProps {
  artistId: string;
  artistUrl: string;
  contractAddress: `0x${string}` | undefined;
  artistBalance: bigint | null;
  artistData: ArtistData | null;
  isLoadingArtist: boolean;
  isVerified: boolean;
  isVerifying: boolean;
  verifyError: string | null;
  artistClaimed: boolean;
  onArtistUrlChange: (url: string) => void;
  onVerify: () => void;
  onClaimSuccess?: () => void;
}

type StepStatus = "completed" | "active" | "disabled" | "pending";

interface Step {
  number: number;
  title: string;
  description: string;
  status: StepStatus;
  content?: React.ReactNode;
}

export function ClaimGuide({
  artistId,
  artistUrl,
  contractAddress,
  artistBalance,
  artistData,
  isLoadingArtist,
  isVerified,
  isVerifying,
  verifyError,
  artistClaimed,
  onArtistUrlChange,
  onVerify,
  onClaimSuccess,
}: ClaimGuideProps) {
  const hasValidUrl = !!artistId;
  const hasBalance = artistBalance !== null && artistBalance > 0n;
  
  const steps: Step[] = [
    {
      number: 1,
      title: "Paste Your Spotify Artist URL",
      description: "Enter your Spotify artist profile URL to get started",
      status: hasValidUrl ? "completed" : "active",
      content: !hasValidUrl ? (
        <Input
          type="text"
          placeholder="https://open.spotify.com/artist/..."
          value={artistUrl}
          onChange={(e) => onArtistUrlChange(e.target.value)}
        />
      ) : hasBalance ? (
        <div className="space-y-4">
          <ArtistInfo
            artistId={artistId}
            artistBalance={artistBalance}
            artistClaimed={artistClaimed}
            contractAddress={contractAddress}
            artistData={artistData}
            isLoadingArtist={isLoadingArtist}
          />
        </div>
      ) : artistBalance === null ? (
        <div className="rounded-lg border border-border/40 bg-muted/10 p-4 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="rounded-lg border border-border/40 bg-muted/10 p-4 text-center text-sm text-muted-foreground">
          Not found
        </div>
      ),
    },
    {
      number: 2,
      title: "Verify Your Identity",
      description: "Add verification code to your Spotify artist bio",
      status: !hasValidUrl
        ? "disabled"
        : isVerified
          ? "completed"
          : "active",
      content: hasValidUrl && !isVerified ? (
        <VerificationFlow
          artistId={artistId}
          isVerified={isVerified}
          isVerifying={isVerifying}
          verifyError={verifyError}
          onVerify={onVerify}
        />
      ) : undefined,
    },
    {
      number: 3,
      title: "Claim Your Balance",
      description: "Claim ownership of your artist donations",
      status: !hasValidUrl || !isVerified
        ? "disabled"
        : artistClaimed
          ? "completed"
          : "active",
      content:
        hasValidUrl && isVerified && !artistClaimed && contractAddress ? (
          <ClaimFlow
            artistId={artistId}
            contractAddress={contractAddress}
            isVerified={isVerified}
            artistClaimed={artistClaimed}
            onClaimSuccess={onClaimSuccess}
          />
        ) : undefined,
    },
    {
      number: 4,
      title: "Withdraw Funds",
      description: "Send your claimed balance to a wallet address",
      status: !hasValidUrl || !artistClaimed ? "disabled" : "active",
      content: hasValidUrl && artistClaimed && contractAddress ? (
        <ArtistWithdrawForm
          contractAddress={contractAddress}
          artistId={artistId}
          onWithdrawSuccess={onClaimSuccess}
        />
      ) : hasValidUrl ? (
        <div className="space-y-4 rounded-lg border border-border bg-muted/5 p-4">
          <div className="space-y-4">
            <AddressInput
              value=""
              onChange={() => {}}
              placeholder="Enter recipient address (0x...)"
              label="Recipient Address"
              disabled={true}
              showValidation={true}
            />
            <Button
              disabled={true}
              className="w-full sm:w-auto"
            >
              Withdraw All
            </Button>
          </div>
        </div>
      ) : undefined,
    },
  ];

  const getStepIcon = (status: StepStatus, isProcessing?: boolean) => {
    if (isProcessing) {
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    }
    switch (status) {
      case "completed":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-5 w-5" />
          </div>
        );
      case "active":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
            <span className="text-sm font-semibold text-primary">
              {steps.find((s) => s.status === "active")?.number}
            </span>
          </div>
        );
      case "disabled":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-muted/30 text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
        );
      case "pending":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-background text-muted-foreground">
            <span className="text-sm font-semibold">{steps.find((s) => s.status === status)?.number}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getStepClasses = (status: StepStatus) => {
    const base = "relative";
    switch (status) {
      case "completed":
        return `${base} opacity-100`;
      case "active":
        return `${base} opacity-100`;
      case "disabled":
        return `${base} opacity-60`;
      case "pending":
        return `${base} opacity-60`;
      default:
        return base;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isProcessing = step.number === 2 && isVerifying;
          const showContent = 
            step.status === "active" || 
            (step.status === "completed" && step.content) ||
            (step.status === "disabled" && step.content);

          return (
            <div key={step.number} className={getStepClasses(step.status)}>
              <div className="flex gap-4">
                {/* Step Icon */}
                <div className="flex flex-col items-center">
                  {getStepIcon(step.status, isProcessing)}
                  {index < steps.length - 1 && (
                    <div
                      className={`mt-2 h-12 w-0.5 ${
                        step.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-muted-foreground/20"
                      }`}
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-3 pb-6">
                  <div>
                    <h4 className="text-base font-semibold text-foreground">
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {showContent && step.content && (
                    <div className="rounded-lg border border-border/40 bg-muted/5 p-4">
                      {step.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

