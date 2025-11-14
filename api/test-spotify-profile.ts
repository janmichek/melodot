const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:5173";
const API_PROFILE_PATH =
  process.env.API_PROFILE_PATH ?? "/api/spotify/profile";

const API_URL = process.argv[2] ?? `${API_BASE_URL}${API_PROFILE_PATH}`;

type Logger = {
  banner: () => void;
  step: (msg: string) => void;
  ok: (msg: string) => void;
  fail: (msg: string) => void;
};

const log: Logger = {
  banner: () => {
    console.log(`${COLORS.yellow}Testing Spotify Profile API${COLORS.reset}`);
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

async function testMissingAccessToken() {
  log.step("3. Testing GET request without accessToken parameter...");
  const response = await fetch(API_URL, { method: "GET" });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing access token");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testInvalidAccessToken() {
  log.step("4. Testing GET request with invalid access token...");
  const invalidToken = "invalid-token-12345";
  const response = await fetch(`${API_URL}?accessToken=${encodeURIComponent(invalidToken)}`, {
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

async function testExpiredAccessToken() {
  log.step("5. Testing GET request with expired access token...");
  // This is a deliberately expired token format
  const expiredToken = "BQDExpiredTokenExample123456789";
  const response = await fetch(`${API_URL}?accessToken=${encodeURIComponent(expiredToken)}`, {
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

async function testWithValidAccessToken() {
  log.step("6. Testing GET request with valid access token...");

  // Check if SPOTIFY_TEST_ACCESS_TOKEN is set in environment
  const testToken = process.env.SPOTIFY_TEST_ACCESS_TOKEN;

  if (!testToken) {
    log.ok("Skipping valid token test - no SPOTIFY_TEST_ACCESS_TOKEN set");
    console.log(`${COLORS.yellow}Note: Set SPOTIFY_TEST_ACCESS_TOKEN environment variable to test with a valid token${COLORS.reset}`);
    console.log(`${COLORS.yellow}You can get a token from: https://developer.spotify.com/console/get-current-user/${COLORS.reset}`);
    return;
  }

  const response = await fetch(`${API_URL}?accessToken=${encodeURIComponent(testToken)}`, {
    method: "GET"
  });
  const body = await response.text();

  if (response.ok) {
    log.ok("API successfully fetched profile with valid token");
    const data = JSON.parse(body);
    console.log(formatBody(body));

    // Verify response structure
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

async function testEmptyAccessToken() {
  log.step("7. Testing GET request with empty access token...");
  const response = await fetch(`${API_URL}?accessToken=`, {
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

async function testAccessTokenAsArrayParameter() {
  log.step("8. Testing GET request with accessToken as array (edge case)...");
  // This tests the typeof accessToken !== 'string' check
  const response = await fetch(`${API_URL}?accessToken=token1&accessToken=token2`, {
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

async function main() {
  log.banner();
  await assertReachable();
  console.log("");
  await testWrongMethod();
  console.log("");
  await testMissingAccessToken();
  console.log("");
  await testInvalidAccessToken();
  console.log("");
  await testExpiredAccessToken();
  console.log("");
  await testEmptyAccessToken();
  console.log("");
  await testAccessTokenAsArrayParameter();
  console.log("");
  await testWithValidAccessToken();
  console.log("");
  log.ok("Test complete");
}

main().catch((error) => {
  log.fail("Unexpected error");
  console.error(error);
  process.exit(1);
});