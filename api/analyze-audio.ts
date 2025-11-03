import type { VercelRequest, VercelResponse } from '@vercel/node';
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
    // Check for API key
    const apiKey = process.env.VITE_RAPIDAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Shazam API not configured',
        details: 'Set VITE_RAPIDAPI_KEY environment variable',
      });
    }

    // Parse multipart form data
    const form = formidable({
      multiples: false,
      maxFileSize: 50 * 1024 * 1024,
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    const [, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Read audio file
    const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);

    // Call Shazam API
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: uploadedFile.mimetype || 'audio/webm' });
    formData.append('file', blob, 'audio.webm');

    const shazamResponse = await fetch(
      'https://shazam-core.p.rapidapi.com/v1/tracks/recognize',
      {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': apiKey,
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

    // Try to fetch artist info if track found
    let artistInfo = null;
    if (result?.track?.subtitle) {
      try {
        const artistInfoResponse = await fetch(
          `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/artist-info?artist=${encodeURIComponent(result.track.subtitle)}`
        );

        if (artistInfoResponse.ok) {
          artistInfo = await artistInfoResponse.json();
        }
      } catch (error) {
        console.error('Failed to fetch artist info:', error);
        // Continue without artist info
      }
    }

    // Clean up
    try {
      await fs.promises.unlink(uploadedFile.filepath);
    } catch (err) {
      console.error('Failed to clean up temp file:', err);
    }

    return res.status(200).json({ ...result, artistInfo });
  } catch (error) {
    console.error('Error analyzing audio:', error);
    return res.status(500).json({
      error: 'Failed to analyze audio',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
