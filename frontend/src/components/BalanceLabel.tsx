// import { useAccount, useBalance } from "wagmi";
// import { formatUnits } from "viem";
// import { useChainId } from "wagmi";
// import { passetHub } from "../wagmi-config";
//
// export function BalanceLabel() {
//   const { address } = useAccount();
//   const chainId = useChainId();
//
//   const { data, isLoading, error } = useBalance({ address });
//
//   const getNetworkInfo = (chainId: number) => {
//     switch (chainId) {
//       case passetHub.id:
//         return {
//           decimals: passetHub.nativeCurrency.decimals,
//           symbol: passetHub.nativeCurrency.symbol,
//           name: passetHub.name
//         };
//     }
//   };
//
//   const networkInfo = getNetworkInfo(chainId);
//   const networkDecimals = data?.decimals ?? networkInfo.decimals;
//
//   return (
//     <div data-testid="balance" className="balance-label">
//       <div>
//         Balance:
//         {data?.value !== undefined &&
//           `${formatUnits(data.value, networkDecimals)} ${data.symbol || networkInfo.symbol}`}{" "}
//         {isLoading && "Loading..."}
//         {error && "Error: " + error.message}
//       </div>
//       <p className="network-info-text">
//         Network: {networkInfo.name} | Currency: {networkInfo.symbol} | Decimals: {networkDecimals}
//       </p>
//     </div>
//   );
// }
