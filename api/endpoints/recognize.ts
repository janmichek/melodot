import type {VercelRequest, VercelResponse} from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';
import {delay, mockDiscoveryData, USE_MOCK_DATA} from '../mock-discovery-data';
import { fetchShazamRecognition, fetchInternalTrackInfo } from '../api';
import { cleanupFile } from '../utils';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024,
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    const [, files] = await form.parse(req as any);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Mock data path
    if (USE_MOCK_DATA) {
      cleanupFile(uploadedFile.filepath);
      await delay(3000);
      return res.status(200).json(mockDiscoveryData);
    }

    const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);
    cleanupFile(uploadedFile.filepath);

    const discovery = await fetchShazamRecognition(fileBuffer);
    // translate shazam ID adamid to Spotify ID
    const spotifyUri = discovery?.track?.hub?.providers?.find((p: any) => p.type === 'SPOTIFY')?.actions?.[0]?.uri;
    const spotifyInfo = spotifyUri ? await fetchInternalTrackInfo(spotifyUri) : null;

    return res.status(200).json({ ...discovery, spotifyInfo });

  } catch (error) {
    const status = (error as any)?.status ?? 500;
    return res.status(status).json({
      error: `Failed to analyze audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}
