import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { useChainId } from "wagmi";
import { passetHub } from "../wagmi-config";

export function Balance() {
  const { address } = useAccount();
  const chainId = useChainId();

  const { data, isLoading, error } = useBalance({ address });


  // Get decimals from wagmi config for proper Asset Hub decimals
  const getNetworkInfo = (chainId: number) => {
    switch (chainId) {
      case passetHub.id:
        return {
          decimals: passetHub.nativeCurrency.decimals, // 10
          symbol: passetHub.nativeCurrency.symbol, // PAS
          name: passetHub.name
        };
      case 1: // Ethereum mainnet
        return {
          decimals: 18,
          symbol: "ETH",
          name: "Ethereum Mainnet"
        };
      default:
        return {
          decimals: 18,
          symbol: "ETH",
          name: "Unknown Network"
        };
    }
  };

  const networkInfo = getNetworkInfo(chainId);
  const networkDecimals = data?.decimals ?? networkInfo.decimals;

  return (
    <div data-testid="balance" className="balance-component-box">

      <div>
        Balance:
        {data?.value !== undefined &&
          `${formatUnits(data.value, networkDecimals)} ${data.symbol || networkInfo.symbol}`}{" "}
        {isLoading && "Loading..."} {error && "Error: " + error.message}
      </div>
      <p className="network-info-text">
        Network: {networkInfo.name} | Currency: {networkInfo.symbol} | Decimals: {networkDecimals}
      </p>
    </div>
  );
}
