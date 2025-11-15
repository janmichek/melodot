const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:5173";

type Logger = {
  banner: (msg: string) => void;
  section: (msg: string) => void;
  step: (msg: string) => void;
  ok: (msg: string) => void;
  fail: (msg: string) => void;
};

const log: Logger = {
  banner: (msg) => {
    console.log(`\n${COLORS.yellow}${"=".repeat(60)}${COLORS.reset}`);
    console.log(`${COLORS.yellow}${msg}${COLORS.reset}`);
    console.log(`${COLORS.yellow}${"=".repeat(60)}${COLORS.reset}\n`);
  },
  section: (msg) => {
    console.log(`\n${COLORS.yellow}${"-".repeat(60)}${COLORS.reset}`);
    console.log(`${COLORS.yellow}${msg}${COLORS.reset}`);
    console.log(`${COLORS.yellow}${"-".repeat(60)}${COLORS.reset}\n`);
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

async function assertReachable(url: string) {
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok || head.status === 405) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ============================================================================
// Discover API Tests
// ============================================================================

const API_DISCOVER_PATH = process.env.API_DISCOVER_PATH ?? "/api/discover";
const DISCOVER_API_URL = `${API_BASE_URL}${API_DISCOVER_PATH}`;

const SILENT_WAV = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x24, 0xf0, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
  0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02, 0x00, 0x10, 0x00,
  0x64, 0x61, 0x74, 0x61, 0x00, 0xf0, 0x00, 0x00,
]);

async function testDiscoverReachable() {
  log.step("1. Checking if Discover API is accessible...");
  const reachable = await assertReachable(DISCOVER_API_URL);
  if (reachable) {
    log.ok("Discover API is reachable");
  } else {
    log.fail("Failed to reach Discover API");
    console.error("Make sure to run: vercel dev");
    throw new Error("API not reachable");
  }
}

async function testDiscoverMissingFile() {
  log.step("2. Testing POST request without file...");
  const response = await fetch(DISCOVER_API_URL, { method: "POST" });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing file");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testDiscoverWithFile() {
  log.step("3. Testing POST request with audio file...");
  const formData = new FormData();
  formData.append(
    "file",
    new File([SILENT_WAV], "test-audio.wav", { type: "audio/wav" })
  );

  const response = await fetch(DISCOVER_API_URL, { method: "POST", body: formData });
  const body = await response.text();

  if (response.ok) {
    log.ok("API successfully processed audio file");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 200, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function runDiscoverTests() {
  log.section("Testing Discover API");
  log.step(`API URL: ${DISCOVER_API_URL}`);
  console.log("");
  
  await testDiscoverReachable();
  console.log("");
  await testDiscoverMissingFile();
  console.log("");
  await testDiscoverWithFile();
}


// ============================================================================
// Spotify Track API Tests
// ============================================================================

const API_TRACK_PATH = process.env.API_TRACK_PATH ?? "/api/track";
const TRACK_API_URL = `${API_BASE_URL}${API_TRACK_PATH}`;

async function testTrackInfoReachable() {
  log.step("1. Checking if Spotify Track API is accessible...");
  const reachable = await assertReachable(TRACK_API_URL);
  if (reachable) {
    log.ok("Spotify Track API is reachable");
  } else {
    log.fail("Failed to reach Spotify Track API");
    console.error("Make sure to run: vercel dev");
    throw new Error("API not reachable");
  }
}

async function testTrackInfoWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...");
  const response = await fetch(TRACK_API_URL, { method: "POST" });
  const body = await response.text();
  if (response.status === 405) {
    log.ok("Correctly returned 405 for wrong method");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 405, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testTrackInfoMissingUri() {
  log.step("3. Testing GET request without URI parameter...");
  const response = await fetch(TRACK_API_URL, { method: "GET" });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing URI");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testTrackInfoInvalidUriFormat() {
  log.step("4. Testing GET request with invalid URI format...");
  const invalidUri = "invalid-uri-format";
  const response = await fetch(`${TRACK_API_URL}?uri=${encodeURIComponent(invalidUri)}`, {
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

async function testTrackInfoSpotifyTrackUri() {
  log.step("5. Testing GET request with valid Spotify track URI...");
  const trackUri = "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"; // Mr. Brightside by The Killers
  const response = await fetch(`${TRACK_API_URL}?uri=${encodeURIComponent(trackUri)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error?.includes('Spotify API not configured')) {
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

async function testTrackInfoSpotifyUrl() {
  log.step("6. Testing GET request with Spotify URL format...");
  const trackUrl = "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp";
  const response = await fetch(`${TRACK_API_URL}?uri=${encodeURIComponent(trackUrl)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error?.includes('Spotify API not configured')) {
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

async function testTrackInfoSpotifySearchUri() {
  log.step("7. Testing GET request with Spotify search URI...");
  const searchUri = "spotify:search:Mr. Brightside The Killers";
  const response = await fetch(`${TRACK_API_URL}?uri=${encodeURIComponent(searchUri)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error?.includes('Spotify API not configured')) {
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

async function testTrackInfoNonExistentTrack() {
  log.step("8. Testing GET request with non-existent track ID...");
  const fakeTrackUri = "spotify:track:00000000000000000000XX";
  const response = await fetch(`${TRACK_API_URL}?uri=${encodeURIComponent(fakeTrackUri)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials");
      console.log(formatBody(body));
      return;
    }
  }

  if (response.status === 400 || response.status === 404) {
    log.ok("API correctly handled non-existent track");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400 or 404, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function runTrackInfoTests() {
  log.section("Testing Spotify Track API");
  log.step(`API URL: ${TRACK_API_URL}`);
  console.log("");
  
  await testTrackInfoReachable();
  console.log("");
  await testTrackInfoWrongMethod();
  console.log("");
  await testTrackInfoMissingUri();
  console.log("");
  await testTrackInfoInvalidUriFormat();
  console.log("");
  await testTrackInfoSpotifyTrackUri();
  console.log("");
  await testTrackInfoSpotifyUrl();
  console.log("");
  await testTrackInfoSpotifySearchUri();
  console.log("");
  await testTrackInfoNonExistentTrack();
}

// ============================================================================
// Artist API Tests
// ============================================================================

const API_ARTIST_PATH = process.env.API_ARTIST_PATH ?? "/api/artist";
const ARTIST_API_URL = `${API_BASE_URL}${API_ARTIST_PATH}`;

async function testArtistReachable() {
  log.step("1. Checking if Artist API is accessible...");
  const reachable = await assertReachable(ARTIST_API_URL);
  if (reachable) {
    log.ok("Artist API is reachable");
  } else {
    log.fail("Failed to reach Artist API");
    console.error("Make sure to run: vercel dev");
    throw new Error("API not reachable");
  }
}

async function testArtistWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...");
  const response = await fetch(ARTIST_API_URL, { method: "POST" });
  const body = await response.text();
  if (response.status === 405) {
    log.ok("Correctly returned 405 for wrong method");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 405, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testArtistMissingUrl() {
  log.step("3. Testing GET request without artistUrl parameter...");
  const response = await fetch(ARTIST_API_URL, { method: "GET" });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing artist URL");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testArtistInvalidUrl() {
  log.step("4. Testing GET request with invalid artist URL...");
  const invalidUrl = "not-a-spotify-url";
  const response = await fetch(`${ARTIST_API_URL}?artistUrl=${encodeURIComponent(invalidUrl)}`, {
    method: "GET"
  });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for invalid URL format");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testArtistValidArtistUrl() {
  log.step("5. Testing GET request with valid artist URL...");
  const artistUrl = "https://open.spotify.com/artist/6nS5roXSAGhTGr34W6n7Et"; // The Killers
  const response = await fetch(`${ARTIST_API_URL}?artistUrl=${encodeURIComponent(artistUrl)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials");
      console.log(formatBody(body));
      console.log(`${COLORS.yellow}Note: Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to test actual API calls${COLORS.reset}`);
      return;
    }
  }

  if (response.ok) {
    log.ok("API successfully fetched artist info");
    const data = JSON.parse(body);
    console.log(formatBody(body));

    if (data.id && data.name) {
      log.ok("Response has expected structure");
    } else {
      log.fail("Response missing expected fields");
    }
  } else {
    log.fail(`Expected 200, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testArtistJustArtistId() {
  log.step("6. Testing GET request with just artist ID (no full URL)...");
  const artistId = "6nS5roXSAGhTGr34W6n7Et"; // The Killers artist ID
  const response = await fetch(`${ARTIST_API_URL}?artistUrl=${encodeURIComponent(artistId)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials");
      console.log(formatBody(body));
      return;
    }
  }

  if (response.ok) {
    log.ok("API successfully handled artist ID format");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 200, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function runArtistTests() {
  log.section("Testing Artist API");
  log.step(`API URL: ${ARTIST_API_URL}`);
  console.log("");

  await testArtistReachable();
  console.log("");
  await testArtistWrongMethod();
  console.log("");
  await testArtistMissingUrl();
  console.log("");
  await testArtistInvalidUrl();
  console.log("");
  await testArtistValidArtistUrl();
  console.log("");
  await testArtistJustArtistId();
}

// ============================================================================
// Artists (Multiple) API Tests
// ============================================================================

const API_ARTISTS_PATH = process.env.API_ARTISTS_PATH ?? "/api/artists";
const ARTISTS_API_URL = `${API_BASE_URL}${API_ARTISTS_PATH}`;

async function testArtistsReachable() {
  log.step("1. Checking if Artists API is accessible...");
  const reachable = await assertReachable(ARTISTS_API_URL);
  if (reachable) {
    log.ok("Artists API is reachable");
  } else {
    log.fail("Failed to reach Artists API");
    console.error("Make sure to run: vercel dev");
    throw new Error("API not reachable");
  }
}

async function testArtistsWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...");
  const response = await fetch(ARTISTS_API_URL, { method: "POST" });
  const body = await response.text();
  if (response.status === 405) {
    log.ok("Correctly returned 405 for wrong method");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 405, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testArtistsMissingIds() {
  log.step("3. Testing GET request without ids parameter...");
  const response = await fetch(ARTISTS_API_URL, { method: "GET" });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing ids");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testArtistsValidIds() {
  log.step("4. Testing GET request with valid artist IDs...");
  const artistIds = "6nS5roXSAGhTGr34W6n7Et,4Z8W4fKeB5YxbusRsdQVPb"; // The Killers, Radiohead
  const response = await fetch(`${ARTISTS_API_URL}?ids=${encodeURIComponent(artistIds)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials");
      console.log(formatBody(body));
      console.log(`${COLORS.yellow}Note: Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to test actual API calls${COLORS.reset}`);
      return;
    }
  }

  if (response.ok) {
    log.ok("API successfully fetched multiple artists");
    const data = JSON.parse(body);
    console.log(formatBody(body));

    if (typeof data === 'object' && Object.keys(data).length > 0) {
      log.ok("Response has expected structure (object map)");
    } else {
      log.fail("Response missing expected structure");
    }
  } else {
    log.fail(`Expected 200, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testArtistsTooManyIds() {
  log.step("5. Testing GET request with more than 50 artist IDs (should fail)...");
  const tooManyIds = Array.from({ length: 51 }, (_, i) => `artist${i}`).join(',');
  const response = await fetch(`${ARTISTS_API_URL}?ids=${encodeURIComponent(tooManyIds)}`, {
    method: "GET"
  });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for too many IDs");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function runArtistsTests() {
  log.section("Testing Artists (Multiple) API");
  log.step(`API URL: ${ARTISTS_API_URL}`);
  console.log("");

  await testArtistsReachable();
  console.log("");
  await testArtistsWrongMethod();
  console.log("");
  await testArtistsMissingIds();
  console.log("");
  await testArtistsValidIds();
  console.log("");
  await testArtistsTooManyIds();
}

// ============================================================================
// Verify API Tests
// ============================================================================

const API_VERIFY_PATH = process.env.API_VERIFY_PATH ?? "/api/verify";
const VERIFY_API_URL = `${API_BASE_URL}${API_VERIFY_PATH}`;

async function testVerifyReachable() {
  log.step("1. Checking if Verify API is accessible...");
  const reachable = await assertReachable(VERIFY_API_URL);
  if (reachable) {
    log.ok("Verify API is reachable");
  } else {
    log.fail("Failed to reach Verify API");
    console.error("Make sure to run: vercel dev");
    throw new Error("API not reachable");
  }
}

async function testVerifyWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...");
  const response = await fetch(VERIFY_API_URL, { method: "POST" });
  const body = await response.text();
  if (response.status === 405) {
    log.ok("Correctly returned 405 for wrong method");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 405, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testVerifyMissingArtistId() {
  log.step("3. Testing GET request without artistId parameter...");
  const response = await fetch(VERIFY_API_URL, { method: "GET" });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing artistId");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testVerifyValidArtistId() {
  log.step("4. Testing GET request with valid artist ID...");
  const artistId = "6nS5roXSAGhTGr34W6n7Et"; // The Killers
  const response = await fetch(`${VERIFY_API_URL}?artistId=${encodeURIComponent(artistId)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error?.includes('RapidAPI key not configured')) {
      log.ok("API correctly reports missing RapidAPI credentials");
      console.log(formatBody(body));
      console.log(`${COLORS.yellow}Note: Set RAPIDAPI_KEY to test actual API calls${COLORS.reset}`);
      return;
    }
  }

  if (response.ok) {
    log.ok("API successfully verified artist");
    const data = JSON.parse(body);
    console.log(formatBody(body));

    if (typeof data.verified === 'boolean') {
      log.ok("Response has expected structure");
    } else {
      log.fail("Response missing expected fields");
    }
  } else {
    log.fail(`Expected 200, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function runVerifyTests() {
  log.section("Testing Verify API");
  log.step(`API URL: ${VERIFY_API_URL}`);
  console.log("");

  await testVerifyReachable();
  console.log("");
  await testVerifyWrongMethod();
  console.log("");
  await testVerifyMissingArtistId();
  console.log("");
  await testVerifyValidArtistId();
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function main() {
  log.banner("API Test Suite - All Endpoints");

  try {
    await runDiscoverTests();
    console.log("");
    await runTrackInfoTests();
    console.log("");
    await runArtistTests();
    console.log("");
    await runArtistsTests();
    console.log("");
    await runVerifyTests();
    console.log("");
    log.banner("All Tests Complete");
  } catch (error) {
    log.fail("Test suite failed");
    console.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  log.fail("Unexpected error");
  console.error(error);
  process.exit(1);
});

