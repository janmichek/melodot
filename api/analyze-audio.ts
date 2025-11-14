import type {VercelRequest, VercelResponse} from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';
import {delay, generateMockDiscoveryData, USE_MOCK_DATA} from './mock-discovery-data';

const SPOTIFY_SERVICE_URL = process.env.SPOTIFY_SERVICE_URL ?? 'http://localhost:5173';

async function fetchSpotifyInfo(spotifyUri: string) {
  try {
    const response = await fetch(`${SPOTIFY_SERVICE_URL}/api/spotify-track-info?uri=${encodeURIComponent(spotifyUri)}`);
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

function cleanupFile(filepath: string) {
  fs.promises.unlink(filepath).catch(() => {});
}

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
      const mockResult = generateMockDiscoveryData();
      const spotifyUri = mockResult.track?.hub?.providers?.find((p: any) => p.type === 'SPOTIFY')?.actions?.[0]?.uri;
      const spotifyInfo = spotifyUri ? await fetchSpotifyInfo(spotifyUri) : null;
      return res.status(200).json({ ...mockResult, spotifyInfo });
    }

    // Real Shazam API path
    const apiKey = process.env.VITE_RAPIDAPI_KEY;
    if (!apiKey) {
      cleanupFile(uploadedFile.filepath);
      await delay(3000);
      return res.status(200).json(generateMockDiscoveryData());
    }

    const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);
    cleanupFile(uploadedFile.filepath);

    const shazamResponse = await fetch(
      'https://shazam-song-recognition-api.p.rapidapi.com/recognize/file',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'shazam-song-recognition-api.p.rapidapi.com',
        },
        body: fileBuffer,
      }
    );

    if (!shazamResponse.ok) {
      if (shazamResponse.status === 403 || shazamResponse.status === 401) {
        await delay(3000);
        return res.status(200).json(generateMockDiscoveryData());
      }
      return res.status(shazamResponse.status).json({
        error: 'Shazam API error',
        details: await shazamResponse.text(),
      });
    }

    const result = await shazamResponse.json();
    const spotifyUri = result?.track?.hub?.providers?.find((p: any) => p.type === 'SPOTIFY')?.actions?.[0]?.uri;
    const spotifyInfo = spotifyUri ? await fetchSpotifyInfo(spotifyUri) : null;

    return res.status(200).json({ ...result, spotifyInfo });

  } catch (error) {
    console.error('Error analyzing audio:', error);
    return res.status(500).json({
      error: 'Failed to analyze audio',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
