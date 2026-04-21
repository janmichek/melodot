import {defineConfig} from '@wagmi/cli'
import {react} from '@wagmi/cli/plugins'
// Import Hardhat artifact to access the ABI array
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import for CLI config
import donateArtifact from './contracts/artifacts/contracts/Donate.sol/Donate.json'
// Import latest deployed addresses from Ignition
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import for CLI config
import deployedAddresses from './contracts/ignition/deployments/chain-420420417/deployed_addresses.json'

const donateDeployedAddress =
  (deployedAddresses as Record<string, string>)['DonateModule#Donate'] as `0x${string}`

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name: 'donate',
      // Provide the ABI array directly to the CLI
      abi: (donateArtifact as { abi: unknown }).abi as any,
      address: {
        420420417: donateDeployedAddress,
      },
    },
  ],
  plugins: [react()],
})


