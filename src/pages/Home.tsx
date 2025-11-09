import {useState} from "react";
import AudioRecorder from "../components/AudioRecorder";
import DiscoveryCard from "../components/DiscoveryCard";
import {DonationForm} from "../components/DonationForm";
import {DiscoveryResult} from "../types";
import {mockDiscoveryData} from "@/lib/mockData";

// Toggle mock data: set to true for mock data, false for real audio analysis
const USE_MOCK_DATA = false;

export function Home() {
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResult | null>(USE_MOCK_DATA ? mockDiscoveryData : null);

  const artistId = discoveryData?.spotifyInfo?.artists?.[0]?.id;

  return (
    <>
      {!discoveryData ? (
        <AudioRecorder onAnalysisComplete={setDiscoveryData} />
      ) : (
        <>
          {discoveryData}
        <DiscoveryCard
          discovery={discoveryData}
          onSearchAgain={() => setDiscoveryData(null)}>
          {artistId && (<DonationForm artistId={artistId}/>)}
        </DiscoveryCard>
        </>

      )}
    </>
  );
}
