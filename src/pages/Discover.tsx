import {useState} from "react";
import AudioRecorder from "../components/AudioRecorder";
import DiscoveryCard from "../components/DiscoveryCard";
import {DonationForm} from "../components/DonationForm";
import {DiscoveryResult} from "../types";

export function Discover() {
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResult | null>(null);

  const artistId = discoveryData?.spotifyInfo?.artists?.[0]?.id;

  return (
    <div className="flex min-h-full w-full items-center justify-center py-6">
      {!discoveryData ? (
        <AudioRecorder onAnalysisComplete={setDiscoveryData} />
      ) : (
        <DiscoveryCard
          discovery={discoveryData!}
          onSearchAgain={() => setDiscoveryData(null)}
        >
          {artistId && <DonationForm artistId={artistId} />}
        </DiscoveryCard>
      )}
    </div>
  );
}

