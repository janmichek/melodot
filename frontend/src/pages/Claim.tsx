import { useWeb3AuthContext } from "../App";
import { Separator } from "../components/ui/separator";
import { ClaimCard } from "../components/ClaimCard";
import { ClaimSpotifyCard } from "../components/ClaimSpotifyCard";

export function Claim() {
  const { contractAddress } = useWeb3AuthContext();

  return (
    <>
      <h1 className="claim-page-title">Artist Claiming</h1>
      <ClaimCard contractAddress={contractAddress} />
      <Separator className="my-4" />
      <ClaimSpotifyCard />
    </>
  );
}
