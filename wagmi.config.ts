import {defineConfig} from '@wagmi/cli'
import {react} from '@wagmi/cli/plugins'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import for CLI config
import donateArtifact from './contracts/out/Donate.sol/Donate.json'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import for CLI config
import deployedAddresses from './contracts/deployments/passetHub.json'

const donateDeployedAddress =
  (deployedAddresses as { Donate: string }).Donate as `0x${string}`

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name: 'donate',
      abi: (donateArtifact as { abi: unknown }).abi as any,
      address: {
        420420422: donateDeployedAddress,
      },
    },
  ],
  plugins: [react()],
})
