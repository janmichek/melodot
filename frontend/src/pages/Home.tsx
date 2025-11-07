import { useState } from "react";
import AudioRecorder from "../components/AudioRecorder";
import DiscoveryCard from "../components/DiscoveryCard";
import { DonationForm } from "../components/DonationForm";
import { DiscoveryResult } from "../types";

export function Home() {
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResult | null>(null);

  const artistId = discoveryData?.track?.artists?.[0]?.adamid;

  return (
    <>
      {!discoveryData ? (
        <AudioRecorder onAnalysisComplete={setDiscoveryData} />
      ) : (
        <DiscoveryCard
          discovery={discoveryData}
          onSearchAgain={() => setDiscoveryData(null)}>
          {artistId && (<DonationForm artistId={artistId}/>)}
        </DiscoveryCard>
      )}
    </>
  );
}
