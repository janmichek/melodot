import {useWeb3AuthContext} from "@/hooks/useWeb3AuthContext";
import {DonationsList} from "@/components/DonationsList";

export function Donations() {
  const {contractAddress} = useWeb3AuthContext();
  
  return (
    <section className="space-y-6 pb-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Donations</h1>
          <p className="text-sm text-muted-foreground">
            Donations Summary
          </p>
        </div>
      </header>
      <DonationsList contractAddress={contractAddress}/>
    </section>
  );
}



