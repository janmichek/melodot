import { defineConfig } from '@wagmi/cli'
import { Abi } from 'viem'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Path to your contract artifacts
const ARTIFACTS_PATH = '../contracts/artifacts-pvm/contracts'
const CHAIN_ID = 420420422

/**
 * Load deployed contract addresses from Hardhat Ignition
 */
function loadDeployedAddresses(): Record<string, string> {
  const addressesFile = `../contracts/ignition/deployments/chain-${CHAIN_ID}/deployed_addresses.json`

  if (existsSync(addressesFile)) {
    try {
      return JSON.parse(readFileSync(addressesFile, 'utf-8'))
    } catch (err) {
      console.error('Error loading deployed addresses:', err)
    }
  }

  return {}
}

/**
 * Recursively reads all contract ABIs from Hardhat artifacts
 */
// todo remove address from params and function
function loadContractABIs(): Array<{ name: string; abi: Abi; address?: Record<number, `0x${string}`> }> {
  const contracts: Array<{ name: string; abi: Abi; address?: Record<number, `0x${string}`> }> = []
  const deployedAddresses = loadDeployedAddresses()


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

            // Try to find deployed address - Hardhat Ignition uses "ModuleName#ContractName" format
            const possibleKeys = [
              `${contractName}Module#${contractName}`,
              contractName
            ]

            let deployedAddress: string | undefined
            for (const key of possibleKeys) {
              if (deployedAddresses[key]) {
                deployedAddress = deployedAddresses[key]
                break
              }
            }

            contracts.push({
              name: contractName,
              abi: artifact.abi as Abi,
              ...(deployedAddress && {
                address: {
                  [CHAIN_ID]: deployedAddress as `0x${string}`
                }
              })
            })

            console.log(`✓ Loaded ${contractName}${deployedAddress ? ` at ${deployedAddress}` : ' (no address)'}`)
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
