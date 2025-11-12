import type {VercelRequest, VercelResponse} from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';

interface ShazamTrack {
  subtitle?: string;
  [key: string]: any;
}

interface DiscoveryResult {
  track?: ShazamTrack;
  artistInfo?: Record<string, unknown>;
  [key: string]: any;
}

// Disable body parsing for formidable to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Analyzes audio using Shazam API
 * Requires VITE_RAPIDAPI_KEY environment variable
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      multiples: false,
      maxFileSize: 50 * 1024 * 1024,
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    let files;
    try {
      const result = await form.parse(req as any);
      files = result[1];

    } catch (parseError) {
      return res.status(500).json({
        error: 'Failed to parse form data',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error',
      });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      console.error('No file in parsed data. Available fields:', Object.keys(files));
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: uploadedFile.mimetype || 'audio/webm' });
    formData.append('file', blob, 'audio.webm');

    const shazamResponse = await fetch(
      'https://shazam-core.p.rapidapi.com/v1/tracks/recognize',
      {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': process.env.VITE_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'shazam-core.p.rapidapi.com',
        },
        body: formData,
      }
    );

    if (!shazamResponse.ok) {
      const errorText = await shazamResponse.text();
      console.error('Shazam API error:', errorText);
      return res.status(shazamResponse.status).json({
        error: 'Shazam API error',
        details: errorText,
      });
    }

    const result = await shazamResponse.json() as DiscoveryResult;

    let spotifyInfo = null;
    const spotifyProvider = result?.track?.hub?.providers?.find((provider: any) => provider.type === 'SPOTIFY');
    const spotifyUri = spotifyProvider?.actions?.[0]?.uri;

    if (spotifyUri) {
      try {
        const baseUrl = 'http://localhost:3000';
        const spotifyResponse = await fetch(
          `${baseUrl}/api/track-info?uri=${encodeURIComponent(spotifyUri)}`
        );

        if (spotifyResponse.ok) {
          spotifyInfo = await spotifyResponse.json();
        }
      } catch (error) {
        console.error('Failed to fetch Spotify info:', error);
      }
    }

    try {
      await fs.promises.unlink(uploadedFile.filepath);
    } catch (err) {
      console.error('Failed to clean up temp file:', err);
    }

    return res.status(200).json({ ...result, spotifyInfo });

  } catch (error) {
    console.error('Error analyzing audio:', error);
    return res.status(500).json({
      error: 'Failed to analyze audio',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
