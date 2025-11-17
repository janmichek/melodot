import type {VercelRequest, VercelResponse} from '@vercel/node'
import {fetchBio, handleApiError, handleApiSuccess} from '../api.js'
import type {BioResponse, VerifyResponse} from '../../types'

/**
 * Verifies that artist biography contains the verification code
 * Requires RAPIDAPI_KEY and VITE_VERIFICATION_CODE environment variables
 *
 * Uses the /v1/artist/overview endpoint with artistId parameter
 * Accepts artist ID only
 * Returns verification result (does not return bio to frontend)
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'GET') {
    return res.status(405).json({error: 'Method not allowed'})
  }

  const {artistId} = req.query

  if (!artistId || typeof artistId !== 'string') {
    return res.status(400).json({error: 'Artist ID is required'})
  }

  try {
    const biography = await fetchBio(artistId) as BioResponse
    const verificationCode = process.env.VITE_VERIFICATION_CODE || ''
    const bio = biography.biography || ''

    const response: VerifyResponse = {
      verified: verificationCode ? bio.includes(verificationCode) : false,
    }

    return handleApiSuccess(res, response)
  } catch (error) {
    return handleApiError(res, error, 'Failed to verify artist')
  }
}

