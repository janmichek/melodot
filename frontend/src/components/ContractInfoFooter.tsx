import { useState } from "react";
import { useReadContract } from "wagmi";
import type { Abi } from "viem";
import { donateConfig } from "../generated";
import { passetHub } from "../wagmi-config";
import { ArtistsList } from "./ArtistsList";

interface ContractInfoFooterProps {
  contractAddress: `0x${string}`;
}

export function ContractInfoFooter({ contractAddress }: ContractInfoFooterProps) {
  const [isArtistsExpanded, setIsArtistsExpanded] = useState(false);

  const { data: count } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "getArtistsCount",
  });

  const { data: balance } = useReadContract({
    address: contractAddress,
    abi: donateConfig.abi as Abi,
    functionName: "balance",
  });

  const artistCount = count ? Number(count) : 0;
  const contractBalance = balance ? (Number(balance) / 10 ** 10).toFixed(2) : "0";

  return (
    <footer className="contract-footer">
      <div className="contract-footer-content">
        <div className="contract-info-inline">
          <span className="contract-info-item">
            {passetHub.name}
          </span>
          <span className="contract-info-separator">•</span>
          <a
            href={`${passetHub.blockExplorers.default.url}/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="contract-info-link"
          >
            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </a>
          <span className="contract-info-separator">•</span>
          {artistCount > 0 ? (
            <button
              onClick={() => setIsArtistsExpanded(!isArtistsExpanded)}
              className="contract-info-toggle"
            >
              {artistCount} artists {isArtistsExpanded ? '▼' : '▲'}
            </button>
          ) : (
            <span className="contract-info-item">
              {artistCount} artists
            </span>
          )}
          <span className="contract-info-separator">•</span>
          <span className="contract-info-item">
            {contractBalance} PAS
          </span>
        </div>

        {artistCount > 0 && isArtistsExpanded && (
          <div className="contract-footer-artists">
            <ArtistsList count={BigInt(artistCount)} contractAddress={contractAddress} />
          </div>
        )}
      </div>
    </footer>
  );
}
