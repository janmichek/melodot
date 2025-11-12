// @ts-check

import {useState} from "react";
import AudioRecorder from "../components/AudioRecorder";
import DiscoveryCard from "../components/DiscoveryCard";
import {DonationForm} from "../components/DonationForm";
import {mockDiscoveryData} from "@/lib/mockData";

/** @typedef {import("../types/index.js").DiscoveryResult} DiscoveryResult */

// Toggle mock data: set to true for mock data, false for real audio analysis
const USE_MOCK_DATA = false;

export function Home() {
  /** @type {[DiscoveryResult|null, (value: DiscoveryResult|null) => void]} */
  const [discoveryData, setDiscoveryData] = useState(USE_MOCK_DATA ? mockDiscoveryData : null);

  const artistId = discoveryData?.spotifyInfo?.artists?.[0]?.id;

  return (
    <>
      {!discoveryData ? (
        <AudioRecorder onAnalysisComplete={setDiscoveryData} />
      ) : (
        <DiscoveryCard
          discovery={discoveryData}
          onSearchAgain={() => setDiscoveryData(null)}
        >
          {artistId && <DonationForm artistId={artistId} />}
        </DiscoveryCard>
      )}
    </>
  );
}
