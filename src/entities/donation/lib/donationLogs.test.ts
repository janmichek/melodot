import {describe, expect, it, vi} from 'vitest'
import {fetchDonationMadeLogs} from './donationLogs'

function makeClient(overrides: Record<string, unknown> = {}) {
  return {
    getChainId: vi.fn().mockResolvedValue(420420417),
    getBlockNumber: vi.fn().mockResolvedValue(125n),
    getLogs: vi.fn().mockResolvedValue([]),
    ...overrides,
  }
}

describe('fetchDonationMadeLogs', () => {
  it('chunks the requested range and verifies the chain', async () => {
    const client = makeClient()
    await fetchDonationMadeLogs(client as never, '0x0000000000000000000000000000000000000001', {
      fromBlock: 100n,
      chunkBlocks: 10n,
      expectedChainId: 420420417,
    })

    expect(client.getChainId).toHaveBeenCalledOnce()
    expect(client.getLogs).toHaveBeenCalledTimes(3)
    expect(client.getLogs.mock.calls.map(([call]) => [call.fromBlock, call.toBlock])).toEqual([
      [100n, 109n],
      [110n, 119n],
      [120n, 125n],
    ])
  })

  it('rejects a wrong-chain RPC before scanning logs', async () => {
    const client = makeClient({getChainId: vi.fn().mockResolvedValue(1)})
    await expect(
      fetchDonationMadeLogs(client as never, '0x0000000000000000000000000000000000000001', {
        expectedChainId: 420420417,
      }),
    ).rejects.toThrow(/Wrong network/)
    expect(client.getLogs).not.toHaveBeenCalled()
  })

  it('wraps eth_getLogs failures with the block range', async () => {
    const client = makeClient({
      getLogs: vi.fn().mockRejectedValue(new Error('range too large')),
    })
    await expect(
      fetchDonationMadeLogs(client as never, '0x0000000000000000000000000000000000000001', {
        fromBlock: 100n,
        chunkBlocks: 10n,
      }),
    ).rejects.toThrow(/100–109/)
  })
})
