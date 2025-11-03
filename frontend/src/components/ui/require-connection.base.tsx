"use client";

import React from "react";

interface RequireConnectionProps {
  chainId: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Base variant of RequireConnection component
 * This is the standalone version that works without reactive-dot or typink
 */
export function RequireConnection({
  chainId,
  fallback,
  children,
}: RequireConnectionProps) {
  // Check if a wallet is connected
  // In a real implementation, this would check actual wallet connection status
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    // Simulate checking for wallet connection
    // In production, you'd connect to actual wallet providers
    const checkConnection = () => {
      // Check if a wallet is connected
      const hasWallet =
        typeof window !== "undefined" &&
        (window as any).ethereum;
      setIsConnected(!!hasWallet);
    };

    checkConnection();
  }, []);

  if (!isConnected) {
    return fallback || <div>Not connected to {chainId}</div>;
  }

  return <>{children}</>;
}
