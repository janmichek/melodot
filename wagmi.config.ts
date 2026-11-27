import {defineConfig} from '@wagmi/cli'
import {react} from '@wagmi/cli/plugins'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import for CLI config
import donateArtifact from './contracts/out/Donate.sol/Donate.json'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import for CLI config
import deployedAddresses from './contracts/deployments/polkadotHubTestnet.json'

const configuredAddress =
  process.env.VITE_CONTRACT_ADDRESS ??
  process.env.CONTRACT_ADDRESS ??
  (deployedAddresses as { Donate: string }).Donate

const donateDeployedAddress = configuredAddress as `0x${string}`

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const allowZeroAddress = process.env.ALLOW_ZERO_ADDRESS === '1'
if (
  !allowZeroAddress &&
  (!/^0x[0-9a-fA-F]{40}$/.test(donateDeployedAddress) || donateDeployedAddress === ZERO_ADDRESS)
) {
  throw new Error(
    'Donate address is not configured. Run `bun run contract:deploy` (or fill ' +
      'contracts/deployments/polkadotHubTestnet.json) before generating types. ' +
      'Set ALLOW_ZERO_ADDRESS=1 only when regenerating an ABI before deployment.',
  )
}

export default defineConfig({
  out: 'src/shared/config/generated.ts',
  contracts: [
    {
      name: 'donate',
      abi: (donateArtifact as { abi: unknown }).abi as any,
      address: {
        420420417: donateDeployedAddress,
      },
    },
  ],
  plugins: [react()],
})
