import {useState} from "react";
import AudioRecorder from "../components/AudioRecorder";
import DiscoveryCard from "../components/DiscoveryCard";
import {DonationForm} from "../components/DonationForm";
import {DiscoveryResult} from "../types";
import {mockDiscoveryData} from "@/lib/mockData";

// Toggle mock data: set to true for mock data, false for real audio analysis
const USE_MOCK_DATA = false;

export function Analyze() {
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResult | null>(USE_MOCK_DATA ? mockDiscoveryData : null);

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
