import type {VercelRequest, VercelResponse} from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';

const SHAZAM_API_URL =
  process.env.SHAZAM_API_URL ??
  'https://shazam-song-recognition-api.p.rapidapi.com/recognize/file';

const SHAZAM_API_HOST =
  process.env.SHAZAM_API_HOST ?? 'shazam-song-recognition-api.p.rapidapi.com';

const SPOTIFY_SERVICE_URL =
  process.env.SPOTIFY_SERVICE_URL ?? 'http://localhost:5173';

const SPOTIFY_TRACK_INFO_PATH =
  process.env.SPOTIFY_TRACK_INFO_PATH ?? '/api/spotify/track/info';


interface ShazamTrack {
  subtitle?: string;
  [key: string]: any;
}

interface DiscoveryResult {
  track?: ShazamTrack;
  artistInfo?: Record<string, unknown>;
  [key: string]: any;
}

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
      // If parsing fails, it might be because there's no file
      // Check if it's a missing file error vs a real parse error
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      
      // If the error is about missing content or invalid format, return 400
      if (errorMessage.includes('content-length') || errorMessage.includes('No file')) {
        return res.status(400).json({ 
          error: 'No audio file provided',
          details: errorMessage,
        });
      }
      
      return res.status(500).json({
        error: 'Failed to parse form data',
        details: errorMessage,
      });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      console.error('No file in parsed data. Available fields:', Object.keys(files));
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);

    // Check if API key is available
    const apiKey = process.env.VITE_RAPIDAPI_KEY;
    


    // Send raw file buffer - Shazam API expects application/octet-stream
    const shazamResponse = await fetch(SHAZAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': SHAZAM_API_HOST,
      },
      body: fileBuffer,
    });

    if (!shazamResponse.ok) {
      const errorText = await shazamResponse.text();
      console.error('Shazam API error:', errorText);
      
      // If API returns 403 (not subscribed) or 401 (unauthorized), return mock data for testing
      if (shazamResponse.status === 403 || shazamResponse.status === 401) {
        console.log('Shazam API subscription issue, returning mock data');
        try {
          await fs.promises.unlink(uploadedFile.filepath);
        } catch (err) {
          console.error('Failed to clean up temp file:', err);
        }
      
      }
      
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
        const spotifyResponse = await fetch(
          `${SPOTIFY_SERVICE_URL}${SPOTIFY_TRACK_INFO_PATH}?uri=${encodeURIComponent(
            spotifyUri
          )}`
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
