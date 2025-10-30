import { useReadContract, useAccount } from "wagmi";
import { Layout, useWeb3AuthContext } from "../components/Layout";
import { AdminWithdrawForm } from "../components/AdminWithdrawForm";
import { donateConfig } from "../generated";
import type { Abi } from "viem";

export function Admin() {
  const { contractAddress, connect, isConnected } = useWeb3AuthContext();
  const { address } = useAccount();

  // Read contract owner
  const { data: owner } = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: donateConfig.abi as Abi,
    functionName: "owner",
    query: { enabled: !!contractAddress }
  });

  // Read total tip fee accumulated (1% of all donations)
  const { data: tipFeeBalance } = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: donateConfig.abi as Abi,
    functionName: "getTipFeeBalance",
    query: { enabled: !!contractAddress }
  });

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  return (
    <Layout>
      {!isConnected && (
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "16px", color: "var(--text-color)" }}>Connect Wallet</h2>
          <p style={{ marginBottom: "24px", color: "var(--text-muted)" }}>
            Please connect your wallet to access the admin panel
          </p>
          <button
            onClick={() => void connect()}
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Connect Wallet
          </button>
        </div>
      )}

      {isConnected && !isOwner && (
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "16px", color: "var(--text-color)" }}>Access Denied</h2>
          <p style={{ marginBottom: "24px", color: "var(--text-muted)" }}>
            You are not authorized to access this panel. Only the contract owner can withdraw tip fees.
          </p>
        </div>
      )}

      {isConnected && isOwner && contractAddress && address ? (
        <AdminWithdrawForm
          contractAddress={contractAddress}
          ownerAddress={address as `0x${string}`}
          tipFeeBalance={tipFeeBalance as bigint | undefined}
        />
      ) : null}
    </Layout>
  );
}
