import type {VercelRequest, VercelResponse} from '@vercel/node'
import type {DiscoveryResult} from '../../types'
import formidable from 'formidable'
import fs from 'fs'
import {fetchDiscovery, fetchSpotifyToken, fetchTrackFromUri, handleApiError, handleApiSuccess} from '../_lib/api.js'
import {cleanupFile} from '../_lib/utils.js'
import {rateLimit} from '../_lib/rateLimit.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'})
  }
  if (!rateLimit(req, res, {key: 'discover', limit: 10, windowMs: 60_000})) {
    return res
  }

  try {
    const form = formidable({
      // The client records at most ~15 seconds; 10 MB is already generous and
      // keeps a public endpoint from buffering huge uploads.
      maxFileSize: 10 * 1024 * 1024,
      maxFiles: 1,
      maxFieldsSize: 1024,
      uploadDir: '/tmp',
      keepExtensions: true,
    })

    const [, files] = await form.parse(req as unknown as Parameters<typeof form.parse>[0])
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file

    if (!uploadedFile) {
      return res.status(400).json({error: 'No audio file provided'})
    }

    // Validate that the uploaded file is an audio file
    const mimetype = uploadedFile.mimetype || ''
    if (!mimetype.startsWith('audio/')) {
      cleanupFile(uploadedFile.filepath)
      return res.status(400).json({error: 'Invalid file type. Only audio files are accepted.'})
    }

    let fileBuffer: Buffer
    try {
      fileBuffer = await fs.promises.readFile(uploadedFile.filepath)
    } finally {
      cleanupFile(uploadedFile.filepath)
    }

    const discovery = await fetchDiscovery(fileBuffer)

    // Get Spotify track info from URI. Enrichment is best-effort: a missing
    // Spotify configuration must not turn a successful Shazam match into a 500.
    const spotifyUri = discovery?.track?.hub?.providers?.find((p: { type: string }) => p.type === 'SPOTIFY')?.actions?.[0]?.uri
    let spotifyInfo = null

    if (spotifyUri) {
      try {
        const accessToken = await fetchSpotifyToken()
        spotifyInfo = await fetchTrackFromUri(spotifyUri, accessToken)
      } catch (error) {
        console.error('Spotify enrichment failed:', error)
      }
    }

    return handleApiSuccess(res, {...discovery, spotifyInfo} as DiscoveryResult)

  } catch (error) {
    return handleApiError(res, error, 'Failed to discover track')
  }
}

