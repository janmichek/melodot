const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:5173";
const API_TRACK_INFO_PATH =
  process.env.API_TRACK_INFO_PATH ?? "/api/spotify/track-info";

const API_URL = process.argv[2] ?? `${API_BASE_URL}${API_TRACK_INFO_PATH}`;

type Logger = {
  banner: () => void;
  step: (msg: string) => void;
  ok: (msg: string) => void;
  fail: (msg: string) => void;
};

const log: Logger = {
  banner: () => {
    console.log(`${COLORS.yellow}Testing Spotify Track Info API${COLORS.reset}`);
    console.log(`API URL: ${API_URL}\n`);
  },
  step: (msg) => console.log(`${COLORS.yellow}${msg}${COLORS.reset}`),
  ok: (msg) => console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`),
  fail: (msg) => console.error(`${COLORS.red}✗ ${msg}${COLORS.reset}`),
};

function formatBody(raw: string) {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw.trim() || "<empty response>";
  }
}

async function assertReachable() {
  log.step("1. Checking if API is accessible...");
  try {
    const head = await fetch(API_URL, { method: "HEAD" });
    if (head.ok || head.status === 405) {
      log.ok("API is reachable");
      return;
    }
    log.fail(`Unexpected status ${head.status}`);
    console.error("Make sure to run: vercel dev");
    process.exit(1);
  } catch (error) {
    log.fail("Failed to reach API");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    console.error("Make sure to run: vercel dev");
    process.exit(1);
  }
}

async function testWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...");
  const response = await fetch(API_URL, { method: "POST" });
  const body = await response.text();
  if (response.status === 405) {
    log.ok("Correctly returned 405 for wrong method");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 405, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testMissingUri() {
  log.step("3. Testing GET request without URI parameter...");
  const response = await fetch(API_URL, { method: "GET" });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing URI");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testInvalidUriFormat() {
  log.step("4. Testing GET request with invalid URI format...");
  const invalidUri = "invalid-uri-format";
  const response = await fetch(`${API_URL}?uri=${encodeURIComponent(invalidUri)}`, {
    method: "GET"
  });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for invalid URI format");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testSpotifyTrackUri() {
  log.step("5. Testing GET request with valid Spotify track URI...");
  // Using Spotify's test track
  const trackUri = "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"; // Mr. Brightside by The Killers
  const response = await fetch(`${API_URL}?uri=${encodeURIComponent(trackUri)}`, {
    method: "GET"
  });
  const body = await response.text();

  // This will fail if SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are not set
  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error === 'Spotify API not configured') {
      log.ok("API correctly reports missing Spotify credentials");
      console.log(formatBody(body));
      console.log(`${COLORS.yellow}Note: Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to test actual API calls${COLORS.reset}`);
      return;
    }
  }

  if (response.ok) {
    log.ok("API successfully fetched track info");
    const data = JSON.parse(body);
    console.log(formatBody(body));

    // Verify response structure
    if (data.id && data.name && data.artists && data.album) {
      log.ok("Response has expected structure");
    } else {
      log.fail("Response missing expected fields");
    }
  } else {
    log.fail(`Expected 200, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testSpotifyUrl() {
  log.step("6. Testing GET request with Spotify URL format...");
  const trackUrl = "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp";
  const response = await fetch(`${API_URL}?uri=${encodeURIComponent(trackUrl)}`, {
    method: "GET"
  });
  const body = await response.text();

  // This will fail if SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are not set
  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error === 'Spotify API not configured') {
      log.ok("API correctly reports missing Spotify credentials");
      console.log(formatBody(body));
      return;
    }
  }

  if (response.ok) {
    log.ok("API successfully parsed URL format and fetched track");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 200, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testSpotifySearchUri() {
  log.step("7. Testing GET request with Spotify search URI...");
  const searchUri = "spotify:search:Mr. Brightside The Killers";
  const response = await fetch(`${API_URL}?uri=${encodeURIComponent(searchUri)}`, {
    method: "GET"
  });
  const body = await response.text();

  // This will fail if SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are not set
  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error === 'Spotify API not configured') {
      log.ok("API correctly reports missing Spotify credentials");
      console.log(formatBody(body));
      return;
    }
  }

  if (response.ok) {
    log.ok("API successfully handled search URI");
    console.log(formatBody(body));
  } else if (response.status === 404) {
    log.ok("API correctly returned 404 for no search results");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 200 or 404, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testNonExistentTrack() {
  log.step("8. Testing GET request with non-existent track ID...");
  const fakeTrackUri = "spotify:track:00000000000000000000XX";
  const response = await fetch(`${API_URL}?uri=${encodeURIComponent(fakeTrackUri)}`, {
    method: "GET"
  });
  const body = await response.text();

  // This will fail if SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are not set
  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error === 'Spotify API not configured') {
      log.ok("API correctly reports missing Spotify credentials");
      console.log(formatBody(body));
      return;
    }
  }

  // Spotify returns 400 for invalid track IDs
  if (response.status === 400 || response.status === 404) {
    log.ok("API correctly handled non-existent track");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400 or 404, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function main() {
  log.banner();
  await assertReachable();
  console.log("");
  await testWrongMethod();
  console.log("");
  await testMissingUri();
  console.log("");
  await testInvalidUriFormat();
  console.log("");
  await testSpotifyTrackUri();
  console.log("");
  await testSpotifyUrl();
  console.log("");
  await testSpotifySearchUri();
  console.log("");
  await testNonExistentTrack();
  console.log("");
  log.ok("Test complete");
}

main().catch((error) => {
  log.fail("Unexpected error");
  console.error(error);
  process.exit(1);
});