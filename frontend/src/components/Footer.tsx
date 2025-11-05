import { useState } from "react";
import { useReadContract } from "wagmi";
import type { Abi } from "viem";
import { donateConfig } from "../generated";
import { passetHub, formatAddress } from "../wagmi-config";
import { ArtistsList } from "./ArtistsList";
import { BalanceDisplay } from "./ui/BalanceDisplay";

interface ContractInfoFooterProps {
  contractAddress: `0x${string}`;
}

export function Footer({ contractAddress }: ContractInfoFooterProps) {
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

  return (
    <footer className="footer">
      <div className="footer-info">
        <span>{passetHub.name}</span>
        <span>•</span>
        <a
          href={`${passetHub.blockExplorers.default.url}/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          {formatAddress(contractAddress, 6, 4)}
        </a>
        <span>•</span>
        {artistCount > 0 ? (
          <button
            onClick={() => setIsArtistsExpanded(!isArtistsExpanded)}
            className="footer-toggle"
          >
            {artistCount} artists {isArtistsExpanded ? '▼' : '▲'}
          </button>
        ) : (
          <span>{artistCount} artists</span>
        )}
        <span>•</span>
        <BalanceDisplay balance={balance as bigint} showSymbol={true} size="small" />
      </div>

      {artistCount > 0 && isArtistsExpanded && (
        <div className="footer-artists">
          <ArtistsList count={BigInt(artistCount)} contractAddress={contractAddress} />
        </div>
      )}
    </footer>
  );
}
