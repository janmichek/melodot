import { defineConfig } from '@wagmi/cli'
import { Abi } from 'viem'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

// Path to your contract artifacts
const ARTIFACTS_PATH = '../contracts/artifacts-pvm/contracts'

/**
 * Recursively reads all contract ABIs from Hardhat artifacts
 */
function loadContractABIs(): Array<{ name: string; abi: Abi; address?: `0x${string}` }> {
  const contracts: Array<{ name: string; abi: Abi; address?: `0x${string}` }> = []

  try {
    // Read all .sol directories
    const contractDirs = readdirSync(ARTIFACTS_PATH)

    for (const dir of contractDirs) {
      const fullPath = join(ARTIFACTS_PATH, dir)

      try {
        // Read all JSON files in the directory
        const files = readdirSync(fullPath).filter(f => f.endsWith('.json') && !f.endsWith('.dbg.json'))

        for (const file of files) {
          const artifactPath = join(fullPath, file)
          const artifact = JSON.parse(readFileSync(artifactPath, 'utf-8'))

          if (artifact.abi && Array.isArray(artifact.abi)) {
            const contractName = file.replace('.json', '')
            contracts.push({
              name: contractName,
              abi: artifact.abi as Abi,
              // todo add address
              // Add your deployed addresses here (optional)
              // address: '0x...' as `0x${string}`
            })
          }
        }
      } catch (err) {
        // Skip directories that can't be read
        continue
      }
    }
  } catch (err) {
    console.error('Error loading contract ABIs:', err)
  }

  return contracts
}

export default defineConfig({
  out: 'src/generated.ts',
  contracts: loadContractABIs().map(({ name, abi, address }) => ({
    name,
    abi,
    ...(address && { address })
  })),
  plugins: [],
})
