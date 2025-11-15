import {useState} from "react";
import AudioRecorder from "../components/AudioRecorder";
import DiscoveryCard from "../components/DiscoveryCard";
import {DonationForm} from "../components/DonationForm";
import {DiscoveryResult} from "../types";
import {Button} from "@/components/ui/button";

export function Discover() {
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResult | null>(null);

  const artistId = discoveryData?.spotifyInfo?.artists?.[0]?.id;

  return (
    <div className="flex min-h-full w-full items-center justify-center py-6">
      {!discoveryData ? (
        <AudioRecorder onAnalysisComplete={setDiscoveryData} />
      ) : (
        <div className="w-full max-w-4xl space-y-4">
          <Button
            onClick={() => setDiscoveryData(null)}
            variant="ghost"
            size="sm"
            className="mb-4"
          >
            ← Discover again
          </Button>
          <DiscoveryCard discovery={discoveryData!}>
            {artistId && <DonationForm artistId={artistId} />}
          </DiscoveryCard>
        </div>
      )}
    </div>
  );
}

