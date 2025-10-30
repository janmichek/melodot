import { Layout, useWeb3AuthContext } from "../components/Layout";
import { Admin } from "./Admin";

export function AdminPage() {
  const { contractAddress, connect, isConnected } = useWeb3AuthContext();

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

      {isConnected && contractAddress &&
        <Admin contractAddress={contractAddress} />
      }
    </Layout>
  );
}
