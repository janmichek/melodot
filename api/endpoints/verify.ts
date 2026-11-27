import type {VercelRequest, VercelResponse} from '@vercel/node'
import {isAddress} from 'viem'
import {privateKeyToAccount} from 'viem/accounts'
import {fetchBio, handleApiError, handleApiSuccess} from '../api.js'
import {rateLimit} from '../rateLimit.js'
import {isValidSpotifyId} from '../utils.js'
import {createChallenge, newChallengeCode, readChallenge} from '../verifyToken.js'
import type {BioResponse, VerifyResponse} from '../../types'

/**
 * Artist verification and EIP-712 claim authorisation.
 *
 * First call (no token) issues a one-time challenge bound to the artist and
 * claimant. The artist pastes the challenge into their Spotify bio. Second call
 * (with token) verifies the bio and returns a short-lived claim signature.
 *
 * Requires RAPIDAPI_KEY, VERIFICATION_SECRET, CLAIM_SIGNER_PRIVATE_KEY and
 * CLAIM_CONTRACT_ADDRESS (or VITE_CONTRACT_ADDRESS).
 */

const CHAIN_ID = 420420417
const CLAIM_TTL_SECONDS = 10 * 60
const CHALLENGE_TTL_SECONDS = 15 * 60

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
  if (!rateLimit(req, res, {key: 'verify', limit: 30, windowMs: 60_000})) {
    return res
  }

  const {artistId, claimant, token} = req.query

  if (!artistId || typeof artistId !== 'string' || !isValidSpotifyId(artistId)) {
    return res.status(400).json({error: 'A valid Spotify artist ID is required'})
  }
  if (!claimant || typeof claimant !== 'string' || !isAddress(claimant)) {
    return res.status(400).json({error: 'A valid claimant address is required'})
  }

  const secret = process.env.VERIFICATION_SECRET
  if (!secret) {
    return res.status(503).json({error: 'Verification is not configured'})
  }

  try {
    if (!token || typeof token !== 'string') {
      const expiresAt = Date.now() + CHALLENGE_TTL_SECONDS * 1000
      const challenge = newChallengeCode()
      const signed = createChallenge(
        {artistId, claimant: claimant as `0x${string}`, challenge, expiresAt},
        secret,
      )
      const response: VerifyResponse = {verified: false, challenge, token: signed, expiresAt}
      return handleApiSuccess(res, response)
    }

    const payload = readChallenge(token, secret)
    if (!payload || payload.artistId !== artistId || payload.claimant.toLowerCase() !== claimant.toLowerCase()) {
      return res.status(400).json({error: 'Invalid verification challenge'})
    }
    if (payload.expiresAt < Date.now()) {
      return res.status(410).json({error: 'Verification challenge expired. Request a new one.'})
    }

    const biography = await fetchBio(artistId) as BioResponse
    const bio =
      biography.biography ||
      biography.data?.biography ||
      biography.artist?.biography ||
      biography.description ||
      biography.data?.description ||
      biography.artist?.description ||
      ''

    if (!bio.includes(payload.challenge)) {
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

    const response: VerifyResponse = {verified: true, signature, deadline}
    return handleApiSuccess(res, response)
  } catch (error) {
    return handleApiError(res, error, 'Failed to verify artist')
  }
}
