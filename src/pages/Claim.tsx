import {useWeb3AuthContext} from "../hooks/useWeb3AuthContext";
import {ClaimCard} from "../components/ClaimCard";

export function Claim() {
  const { contractAddress } = useWeb3AuthContext();

  return (
    <section className="space-y-6 pb-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Artist Claiming</h1>
        <p className="text-sm text-muted-foreground">
          Claim your artist identity and withdraw donations made to your music.
        </p>
      </header>

      <ClaimCard contractAddress={contractAddress} />
    </section>
  );
}
