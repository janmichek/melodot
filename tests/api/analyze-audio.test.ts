import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { createServer } from 'http';
import type { AddressInfo } from 'net';
import handler from '../../api/analyze-audio';

const mockShazamResponse = {
  track: {
    title: 'Test Track',
    subtitle: 'Test Artist',
    hub: {
      providers: [
        {
          type: 'SPOTIFY',
          actions: [{ uri: 'spotify:track:123' }],
        },
      ],
    },
  },
};

const mockSpotifyInfo = {
  name: 'Mock Track',
  album: 'Mock Album',
};

describe('analyze-audio API', () => {
  let server: ReturnType<typeof createServer>;
  let apiUrl: string;
  const originalFetch = globalThis.fetch;

  beforeAll(async () => {
    process.env.VITE_RAPIDAPI_KEY = 'test-key';

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const target =
        typeof input === 'string'
          ? input
          : input instanceof Request
            ? input.url
            : input instanceof URL
              ? input.toString()
              : '';

      if (target.startsWith('https://shazam-core.p.rapidapi.com')) {
        return new Response(JSON.stringify(mockShazamResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (target.startsWith('http://localhost:3000/api/track-info')) {
        return new Response(JSON.stringify(mockSpotifyInfo), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return originalFetch(input as any, init);
    };

    server = createServer((req, res) => {
      const vercelRes = Object.assign(res, {
        status(statusCode: number) {
          res.statusCode = statusCode;
          return vercelRes;
        },
        json(payload: unknown) {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json');
          }
          res.end(JSON.stringify(payload));
          return vercelRes;
        },
      });

      void handler(req as any, vercelRes as any);
    });

    await new Promise<void>((resolve) => {
      server.listen(0, resolve);
    });

    const address = server.address() as AddressInfo;
    apiUrl = `http://127.0.0.1:${address.port}/api/analyze-audio`;
  });

  afterAll(async () => {
    globalThis.fetch = originalFetch;

    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('rejects non-POST methods', async () => {
    const response = await fetch(apiUrl);
    expect(response.status).toBe(405);

    const body = await response.json();
    expect(body).toEqual({ error: 'Method not allowed' });
  });

  it('returns 400 when no audio file is provided', async () => {
    const formData = new FormData();
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: 'No audio file provided' });
  });

  it('returns recognized track data when an audio file is provided', async () => {
    const formData = new FormData();
    const sampleAudio = new Blob([new Uint8Array([0, 1, 2, 3])], {
      type: 'audio/webm',
    });

    formData.append('file', sampleAudio, 'sample.webm');

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.track.title).toBe('Test Track');
    expect(body.spotifyInfo).toEqual(mockSpotifyInfo);
  });
});

