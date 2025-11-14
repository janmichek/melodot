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
// Analyze Audio API Tests
// ============================================================================

const API_ANALYZE_PATH = process.env.API_ANALYZE_PATH ?? "/api/analyze-audio";
const ANALYZE_API_URL = `${API_BASE_URL}${API_ANALYZE_PATH}`;

const SILENT_WAV = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x24, 0xf0, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
  0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02, 0x00, 0x10, 0x00,
  0x64, 0x61, 0x74, 0x61, 0x00, 0xf0, 0x00, 0x00,
]);

async function testAnalyzeAudioReachable() {
  log.step("1. Checking if Analyze Audio API is accessible...");
  const reachable = await assertReachable(ANALYZE_API_URL);
  if (reachable) {
    log.ok("Analyze Audio API is reachable");
  } else {
    log.fail("Failed to reach Analyze Audio API");
    console.error("Make sure to run: vercel dev");
    throw new Error("API not reachable");
  }
}

async function testAnalyzeAudioMissingFile() {
  log.step("2. Testing POST request without file...");
  const response = await fetch(ANALYZE_API_URL, { method: "POST" });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing file");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testAnalyzeAudioWithFile() {
  log.step("3. Testing POST request with audio file...");
  const formData = new FormData();
  formData.append(
    "file",
    new File([SILENT_WAV], "test-audio.wav", { type: "audio/wav" })
  );

  const response = await fetch(ANALYZE_API_URL, { method: "POST", body: formData });
  const body = await response.text();

  if (response.ok) {
    log.ok("API successfully processed audio file");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 200, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function runAnalyzeAudioTests() {
  log.section("Testing Analyze Audio API");
  log.step(`API URL: ${ANALYZE_API_URL}`);
  console.log("");
  
  await testAnalyzeAudioReachable();
  console.log("");
  await testAnalyzeAudioMissingFile();
  console.log("");
  await testAnalyzeAudioWithFile();
}

// ============================================================================
// Spotify Profile API Tests
// ============================================================================

const API_PROFILE_PATH = process.env.API_PROFILE_PATH ?? "/api/spotify/profile";
const PROFILE_API_URL = `${API_BASE_URL}${API_PROFILE_PATH}`;

async function testProfileReachable() {
  log.step("1. Checking if Spotify Profile API is accessible...");
  const reachable = await assertReachable(PROFILE_API_URL);
  if (reachable) {
    log.ok("Spotify Profile API is reachable");
  } else {
    log.fail("Failed to reach Spotify Profile API");
    console.error("Make sure to run: vercel dev");
    throw new Error("API not reachable");
  }
}

async function testProfileWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...");
  const response = await fetch(PROFILE_API_URL, { method: "POST" });
  const body = await response.text();
  if (response.status === 405) {
    log.ok("Correctly returned 405 for wrong method");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 405, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testProfileMissingAccessToken() {
  log.step("3. Testing GET request without accessToken parameter...");
  const response = await fetch(PROFILE_API_URL, { method: "GET" });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing access token");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testProfileInvalidAccessToken() {
  log.step("4. Testing GET request with invalid access token...");
  const invalidToken = "invalid-token-12345";
  const response = await fetch(`${PROFILE_API_URL}?accessToken=${encodeURIComponent(invalidToken)}`, {
    method: "GET"
  });
  const body = await response.text();
  if (response.status === 401) {
    log.ok("Correctly returned 401 for invalid access token");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 401, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testProfileExpiredAccessToken() {
  log.step("5. Testing GET request with expired access token...");
  const expiredToken = "BQDExpiredTokenExample123456789";
  const response = await fetch(`${PROFILE_API_URL}?accessToken=${encodeURIComponent(expiredToken)}`, {
    method: "GET"
  });
  const body = await response.text();
  if (response.status === 401) {
    log.ok("Correctly returned 401 for expired access token");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 401, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testProfileEmptyAccessToken() {
  log.step("6. Testing GET request with empty access token...");
  const response = await fetch(`${PROFILE_API_URL}?accessToken=`, {
    method: "GET"
  });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for empty access token");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testProfileAccessTokenAsArray() {
  log.step("7. Testing GET request with accessToken as array (edge case)...");
  const response = await fetch(`${PROFILE_API_URL}?accessToken=token1&accessToken=token2`, {
    method: "GET"
  });
  const body = await response.text();
  if (response.status === 400 || response.status === 401) {
    log.ok("Correctly handled array parameter");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400 or 401, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testProfileWithValidAccessToken() {
  log.step("8. Testing GET request with valid access token...");
  const testToken = process.env.SPOTIFY_TEST_ACCESS_TOKEN;

  if (!testToken) {
    log.ok("Skipping valid token test - no SPOTIFY_TEST_ACCESS_TOKEN set");
    console.log(`${COLORS.yellow}Note: Set SPOTIFY_TEST_ACCESS_TOKEN environment variable to test with a valid token${COLORS.reset}`);
    console.log(`${COLORS.yellow}You can get a token from: https://developer.spotify.com/console/get-current-user/${COLORS.reset}`);
    return;
  }

  const response = await fetch(`${PROFILE_API_URL}?accessToken=${encodeURIComponent(testToken)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.ok) {
    log.ok("API successfully fetched profile with valid token");
    const data = JSON.parse(body);
    console.log(formatBody(body));

    if (data.id && data.displayName !== undefined) {
      log.ok("Response has expected structure");
    } else {
      log.fail("Response missing expected fields");
    }
  } else if (response.status === 401) {
    log.fail("Token might be expired or invalid");
    console.log(formatBody(body));
    console.log(`${COLORS.yellow}Get a fresh token from: https://developer.spotify.com/console/get-current-user/${COLORS.reset}`);
  } else {
    log.fail(`Expected 200, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function runProfileTests() {
  log.section("Testing Spotify Profile API");
  log.step(`API URL: ${PROFILE_API_URL}`);
  console.log("");
  
  await testProfileReachable();
  console.log("");
  await testProfileWrongMethod();
  console.log("");
  await testProfileMissingAccessToken();
  console.log("");
  await testProfileInvalidAccessToken();
  console.log("");
  await testProfileExpiredAccessToken();
  console.log("");
  await testProfileEmptyAccessToken();
  console.log("");
  await testProfileAccessTokenAsArray();
  console.log("");
  await testProfileWithValidAccessToken();
}

// ============================================================================
// Spotify Track Info API Tests
// ============================================================================

const API_TRACK_INFO_PATH = process.env.API_TRACK_INFO_PATH ?? "/api/spotify/track-info";
const TRACK_INFO_API_URL = `${API_BASE_URL}${API_TRACK_INFO_PATH}`;

async function testTrackInfoReachable() {
  log.step("1. Checking if Spotify Track Info API is accessible...");
  const reachable = await assertReachable(TRACK_INFO_API_URL);
  if (reachable) {
    log.ok("Spotify Track Info API is reachable");
  } else {
    log.fail("Failed to reach Spotify Track Info API");
    console.error("Make sure to run: vercel dev");
    throw new Error("API not reachable");
  }
}

async function testTrackInfoWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...");
  const response = await fetch(TRACK_INFO_API_URL, { method: "POST" });
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
  const response = await fetch(TRACK_INFO_API_URL, { method: "GET" });
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
  const response = await fetch(`${TRACK_INFO_API_URL}?uri=${encodeURIComponent(invalidUri)}`, {
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
  const response = await fetch(`${TRACK_INFO_API_URL}?uri=${encodeURIComponent(trackUri)}`, {
    method: "GET"
  });
  const body = await response.text();

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
  const response = await fetch(`${TRACK_INFO_API_URL}?uri=${encodeURIComponent(trackUrl)}`, {
    method: "GET"
  });
  const body = await response.text();

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

async function testTrackInfoSpotifySearchUri() {
  log.step("7. Testing GET request with Spotify search URI...");
  const searchUri = "spotify:search:Mr. Brightside The Killers";
  const response = await fetch(`${TRACK_INFO_API_URL}?uri=${encodeURIComponent(searchUri)}`, {
    method: "GET"
  });
  const body = await response.text();

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

async function testTrackInfoNonExistentTrack() {
  log.step("8. Testing GET request with non-existent track ID...");
  const fakeTrackUri = "spotify:track:00000000000000000000XX";
  const response = await fetch(`${TRACK_INFO_API_URL}?uri=${encodeURIComponent(fakeTrackUri)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.status === 500) {
    const bodyJson = JSON.parse(body);
    if (bodyJson.error === 'Spotify API not configured') {
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
  log.section("Testing Spotify Track Info API");
  log.step(`API URL: ${TRACK_INFO_API_URL}`);
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
// Main Test Runner
// ============================================================================

async function main() {
  log.banner("API Test Suite - All Endpoints");
  
  try {
    await runAnalyzeAudioTests();
    console.log("");
    await runProfileTests();
    console.log("");
    await runTrackInfoTests();
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
