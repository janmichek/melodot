import type {VercelRequest, VercelResponse} from '@vercel/node'
import type {DiscoveryResult} from '../../types'
import formidable from 'formidable'
import fs from 'fs'
import {fetchDiscovery, fetchSpotifyToken, fetchTrackFromUri, handleApiError, handleApiSuccess} from '../api.js'
import {cleanupFile} from '../utils.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'})
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024,
      uploadDir: '/tmp',
      keepExtensions: true,
    })

    const [, files] = await form.parse(req as unknown as Parameters<typeof form.parse>[0])
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file

    if (!uploadedFile) {
      return res.status(400).json({error: 'No audio file provided'})
    }

    const fileBuffer = await fs.promises.readFile(uploadedFile.filepath)
    cleanupFile(uploadedFile.filepath)

    const discovery = await fetchDiscovery(fileBuffer)

    // Get Spotify track info from URI
    const spotifyUri = discovery?.track?.hub?.providers?.find((p: { type: string }) => p.type === 'SPOTIFY')?.actions?.[0]?.uri
    let spotifyInfo = null

    if (spotifyUri) {
      const accessToken = await fetchSpotifyToken()
      spotifyInfo = await fetchTrackFromUri(spotifyUri, accessToken)
    }

    return handleApiSuccess(res, {...discovery, spotifyInfo} as DiscoveryResult)

  } catch (error) {
    return handleApiError(res, error, 'Failed to discover track')
  }
}

