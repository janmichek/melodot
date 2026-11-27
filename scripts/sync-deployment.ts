import {existsSync, readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

/**
 * Copies the address produced by `forge script --broadcast` into the JSON file
 * consumed by wagmi.config.ts. Without this step `bun run generate` would keep
 * writing the zero-address placeholder into src/generated.ts.
 */

const chainId = process.env.CHAIN_ID ?? '420420417'
const broadcastPath = join('contracts', 'broadcast', 'Deploy.s.sol', chainId, 'run-latest.json')
const deploymentsPath = join('contracts', 'deployments', 'polkadotHubTestnet.json')

if (!existsSync(broadcastPath)) {
  throw new Error(`Broadcast artifact not found: ${broadcastPath}. Run the deploy script with --broadcast first.`)
}

type BroadcastTx = {
  transactionType?: string
  contractName?: string
  contractAddress?: string
}

const broadcast = JSON.parse(readFileSync(broadcastPath, 'utf8')) as {transactions?: BroadcastTx[]}
const deployment = broadcast.transactions?.find(
  (tx) => tx.transactionType === 'CREATE' && tx.contractName === 'Donate' && tx.contractAddress,
)

if (!deployment?.contractAddress) {
  throw new Error(`No Donate deployment found in ${broadcastPath}`)
}

writeFileSync(deploymentsPath, `${JSON.stringify({Donate: deployment.contractAddress}, null, 2)}\n`)
console.log(`Recorded Donate deployment: ${deployment.contractAddress}`)
