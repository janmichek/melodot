import type {VercelRequest, VercelResponse} from '@vercel/node'
import {isAddress} from 'viem'
import {privateKeyToAccount} from 'viem/accounts'
import {fetchBio, handleApiError, handleApiSuccess} from '../api.js'
import {isValidSpotifyId} from '../utils.js'
import type {BioResponse, VerifyResponse} from '../../types'

/**
 * Verifies that an artist biography contains the verification code and, when
 * it does, issues a short-lived EIP-712 authorisation for the claimant to call
 * `Donate.claimArtist`.
 *
 * Requires RAPIDAPI_KEY, VITE_VERIFICATION_CODE, CLAIM_SIGNER_PRIVATE_KEY and
 * CLAIM_CONTRACT_ADDRESS (or VITE_CONTRACT_ADDRESS).
 */

const CHAIN_ID = 420420417
const CLAIM_TTL_SECONDS = 10 * 60

const CLAIM_TYPES = {
  Claim: [
    {name: 'artistId', type: 'string'},
    {name: 'claimant', type: 'address'},
    {name: 'deadline', type: 'uint256'},
  ],
} as const

function getClaimSigner() {
  const privateKey = process.env.CLAIM_SIGNER_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('Claim signer is not configured')
  }
  return privateKeyToAccount(privateKey as `0x${string}`)
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'GET') {
    return res.status(405).json({error: 'Method not allowed'})
  }

  const {artistId, claimant} = req.query

  if (!artistId || typeof artistId !== 'string' || !isValidSpotifyId(artistId)) {
    return res.status(400).json({error: 'A valid Spotify artist ID is required'})
  }
  if (!claimant || typeof claimant !== 'string' || !isAddress(claimant)) {
    return res.status(400).json({error: 'A valid claimant address is required'})
  }

  try {
    const biography = await fetchBio(artistId) as BioResponse
    const verificationCode = process.env.VITE_VERIFICATION_CODE || ''
    // The scraper has returned the bio at several nesting levels over time.
    const bio =
      biography.biography ||
      biography.data?.biography ||
      biography.artist?.biography ||
      biography.description ||
      biography.data?.description ||
      biography.artist?.description ||
      ''

    const verified = Boolean(verificationCode) && bio.includes(verificationCode)

    if (!verified) {
      const response: VerifyResponse = {verified: false}
      return handleApiSuccess(res, response)
    }

    const verifyingContract = (process.env.CLAIM_CONTRACT_ADDRESS || process.env.VITE_CONTRACT_ADDRESS) as
      | `0x${string}`
      | undefined
    if (!verifyingContract || !isAddress(verifyingContract)) {
      return res.status(503).json({error: 'Claim contract address is not configured'})
    }

    const signer = getClaimSigner()
    const deadline = Math.floor(Date.now() / 1000) + CLAIM_TTL_SECONDS
    const signature = await signer.signTypedData({
      domain: {
        name: 'Donalyze',
        version: '1',
        chainId: CHAIN_ID,
        verifyingContract,
      },
      types: CLAIM_TYPES,
      primaryType: 'Claim',
      message: {
        artistId,
        claimant: claimant as `0x${string}`,
        deadline: BigInt(deadline),
      },
    })

    const response: VerifyResponse = {
      verified: true,
      signature,
      deadline,
    }
    return handleApiSuccess(res, response)
  } catch (error) {
    return handleApiError(res, error, 'Failed to verify artist')
  }
}
