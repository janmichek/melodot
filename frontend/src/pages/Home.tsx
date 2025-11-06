import { useState } from "react";
import { Layout, useWeb3AuthContext } from "../components/Layout";
import AudioRecorder from "../components/AudioRecorder";
import DiscoveryCard from "../components/DiscoveryCard";
import { DonationForm } from "../components/DonationForm";
import { DiscoveryResult } from "../types";

export function Home() {
  const { contractAddress } = useWeb3AuthContext();
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResult | null>(null);

  const artistId = discoveryData?.track?.artists?.[0]?.adamid;

  return (
    <Layout>
      {!discoveryData ? (
        <AudioRecorder onAnalysisComplete={setDiscoveryData} />
      ) : (
        <DiscoveryCard
          discovery={discoveryData}
          onSearchAgain={() => setDiscoveryData(null)}>
          {contractAddress && artistId && (
            <DonationForm
              contractAddress={contractAddress}
              artistId={artistId}
            />
          )}
        </DiscoveryCard>
      )}
    </Layout>
  );
}
