import {useWeb3AuthContext} from "../App";
import {ClaimCard} from "../components/ClaimCard";

export function Claim() {
  const { contractAddress } = useWeb3AuthContext();

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Artist Claiming</h1>
      <ClaimCard contractAddress={contractAddress} />
    </>
  );
}
