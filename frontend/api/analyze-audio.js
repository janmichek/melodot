import Busboy from 'busboy';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting audio analysis request...');

    // Parse multipart form data
    const fileData = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let fileBuffer = null;
      let fileName = null;
      let mimeType = null;

      busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType: mime } = info;
        fileName = filename;
        mimeType = mime;
        const chunks = [];

        file.on('data', (data) => {
          chunks.push(data);
        });

        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      busboy.on('finish', () => {
        if (!fileBuffer) {
          reject(new Error('No file uploaded'));
        } else {
          resolve({ buffer: fileBuffer, fileName, mimeType });
        }
      });

      busboy.on('error', reject);

      req.pipe(busboy);
    });

    // Create FormData for Shazam API
    const formData = new FormData();
    const blob = new Blob([fileData.buffer], { type: fileData.mimeType });
    formData.append('file', blob, fileData.fileName || 'audio.webm');

    const response = await fetch('https://shazam-core.p.rapidapi.com/v1/tracks/recognize', {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': process.env.VITE_RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'shazam-core.p.rapidapi.com',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shazam API error:', errorText);
      return res.status(response.status).json({
        error: 'Shazam API error',
        details: errorText
      });
    }

    const result = await response.json();

    // Fetch artist social links if we have a track
    let artistInfo = null;
    if (result?.track?.subtitle) {
      try {
        const artistName = result.track.subtitle;
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000';

        const artistInfoResponse = await fetch(
          `${baseUrl}/api/artist-info?artist=${encodeURIComponent(artistName)}`
        );

        if (artistInfoResponse.ok) {
          artistInfo = await artistInfoResponse.json();
        }
      } catch (error) {
        console.error('Failed to fetch artist info:', error);
        // Continue without artist info if it fails
      }
    }

    return res.status(200).json({ ...result, artistInfo });
  } catch (error) {
    console.error('Audio analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to analyze audio',
      details: errorMessage
    });
  }
}