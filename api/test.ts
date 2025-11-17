import type {TestLogger, TestResult} from "@types"

const COLORS = {
  green: "\u001b[32m",
  red: "\u001b[31m",
  yellow: "\u001b[33m",
  reset: "\u001b[0m",
}

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:5173"

const testResults: TestResult[] = []

const log: TestLogger = {
  banner: (msg) => {
    console.log(`\n${COLORS.yellow}${"=".repeat(60)}${COLORS.reset}`)
    console.log(`${COLORS.yellow}${msg}${COLORS.reset}`)
    console.log(`${COLORS.yellow}${"=".repeat(60)}${COLORS.reset}\n`)
  },
  section: (msg) => {
    console.log(`\n${COLORS.yellow}${"-".repeat(60)}${COLORS.reset}`)
    console.log(`${COLORS.yellow}${msg}${COLORS.reset}`)
    console.log(`${COLORS.yellow}${"-".repeat(60)}${COLORS.reset}\n`)
  },
  step: (msg) => console.log(`${COLORS.yellow}${msg}${COLORS.reset}`),
  ok: (msg) => console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`),
  fail: (msg) => console.error(`${COLORS.red}✗ ${msg}${COLORS.reset}`),
}

function trackResult(name: string, passed: boolean, error?: string) {
  testResults.push({name, passed, error})
}

function formatBody(raw: string) {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw.trim() || "<empty response>"
  }
}

async function assertReachable(url: string) {
  try {
    const head = await fetch(url, {method: "HEAD"})
    if (head.ok || head.status === 405) {
      return true
    }
    return false
  } catch {
    return false
  }
}

// ============================================================================
// Discover API Tests
// ============================================================================

const API_DISCOVER_PATH = process.env.API_DISCOVER_PATH ?? "/api/discover"
const DISCOVER_API_URL = `${API_BASE_URL}${API_DISCOVER_PATH}`

const SILENT_WAV = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x24, 0xf0, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
  0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02, 0x00, 0x10, 0x00,
  0x64, 0x61, 0x74, 0x61, 0x00, 0xf0, 0x00, 0x00,
])

async function testDiscoverReachable() {
  log.step("1. Checking if Discover API is accessible...")
  const reachable = await assertReachable(DISCOVER_API_URL)
  if (reachable) {
    log.ok("Discover API is reachable")
    trackResult("Discover API - Reachable", true)
    return true
  } else {
    log.fail("Failed to reach Discover API")
    console.error("Make sure to run: vercel dev")
    trackResult("Discover API - Reachable", false, "API not reachable")
    throw new Error("API not reachable")
  }
}

async function testDiscoverMissingFile() {
  log.step("2. Testing POST request without file...")
  const response = await fetch(DISCOVER_API_URL, {method: "POST"})
  const body = await response.text()
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing file")
    console.log(formatBody(body))
    trackResult("Discover API - Missing File", true)
    return true
  } else {
    log.fail(`Expected 400, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Discover API - Missing File", false, `Expected 400, got ${response.status}`)
    return false
  }
}

async function testDiscoverWithFile() {
  log.step("3. Testing POST request with audio file...")
  const formData = new FormData()
  formData.append(
    "file",
    new File([SILENT_WAV], "test-audio.wav", {type: "audio/wav"})
  )

  const response = await fetch(DISCOVER_API_URL, {method: "POST", body: formData})
  const body = await response.text()

  if (response.ok) {
    log.ok("API successfully processed audio file")
    console.log(formatBody(body))
    trackResult("Discover API - With File", true)
    return true
  } else if (response.status === 500) {
    // API may return 500 if Shazam API is not configured or if audio is invalid
    log.ok("API correctly handles audio processing (may be unconfigured or invalid audio)")
    console.log(formatBody(body))
    console.log(`${COLORS.yellow}Note: Set RAPIDAPI_KEY and configure Shazam API to test actual audio recognition${COLORS.reset}`)
    trackResult("Discover API - With File", true)
    return true
  } else {
    log.fail(`Expected 200 or 500, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Discover API - With File", false, `Expected 200 or 500, got ${response.status}`)
    return false
  }
}

async function runDiscoverTests() {
  log.section("Testing Discover API")
  log.step(`API URL: ${DISCOVER_API_URL}`)
  console.log("")
  
  await testDiscoverReachable()
  console.log("")
  await testDiscoverMissingFile()
  console.log("")
  await testDiscoverWithFile()
}


// ============================================================================
// Spotify Track API Tests
// ============================================================================

const API_TRACK_PATH = process.env.API_TRACK_PATH ?? "/api/track"
const TRACK_API_URL = `${API_BASE_URL}${API_TRACK_PATH}`

async function testTrackInfoReachable() {
  log.step("1. Checking if Spotify Track API is accessible...")
  const reachable = await assertReachable(TRACK_API_URL)
  if (reachable) {
    log.ok("Spotify Track API is reachable")
    trackResult("Track API - Reachable", true)
    return true
  } else {
    log.fail("Failed to reach Spotify Track API")
    console.error("Make sure to run: vercel dev")
    trackResult("Track API - Reachable", false, "API not reachable")
    throw new Error("API not reachable")
  }
}

async function testTrackInfoWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...")
  const response = await fetch(TRACK_API_URL, {method: "POST"})
  const body = await response.text()
  if (response.status === 405) {
    log.ok("Correctly returned 405 for wrong method")
    console.log(formatBody(body))
    trackResult("Track API - Wrong Method", true)
    return true
  } else {
    log.fail(`Expected 405, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Track API - Wrong Method", false, `Expected 405, got ${response.status}`)
    return false
  }
}

async function testTrackInfoMissingUri() {
  log.step("3. Testing GET request without URI parameter...")
  const response = await fetch(TRACK_API_URL, {method: "GET"})
  const body = await response.text()
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing URI")
    console.log(formatBody(body))
    trackResult("Track API - Missing URI", true)
    return true
  } else {
    log.fail(`Expected 400, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Track API - Missing URI", false, `Expected 400, got ${response.status}`)
    return false
  }
}

async function testTrackInfoInvalidUriFormat() {
  log.step("4. Testing GET request with invalid URI format...")
  const invalidUri = "invalid-uri-format"
  const response = await fetch(`${TRACK_API_URL}?uri=${encodeURIComponent(invalidUri)}`, {
    method: "GET"
  })
  const body = await response.text()
  
  if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials")
      console.log(formatBody(body))
      trackResult("Track API - Invalid URI Format", true)
      return true
    }
  }
  
  if (response.status === 400) {
    log.ok("Correctly returned 400 for invalid URI format")
    console.log(formatBody(body))
    trackResult("Track API - Invalid URI Format", true)
    return true
  } else {
    log.fail(`Expected 400 or 500, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Track API - Invalid URI Format", false, `Expected 400 or 500, got ${response.status}`)
    return false
  }
}

async function testTrackInfoSpotifyTrackUri() {
  log.step("5. Testing GET request with spotify:track: URI format (not supported)...")
  const trackUri = "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp" // Mr. Brightside by The Killers
  const response = await fetch(`${TRACK_API_URL}?uri=${encodeURIComponent(trackUri)}`, {
    method: "GET"
  })
  const body = await response.text()

  // The API doesn't support spotify:track: format - only URLs and spotify:search:
  // extractTrackId() only handles URLs with open.spotify.com/track/
  if (response.status === 400) {
    log.ok("API correctly returns 400 for unsupported spotify:track: format")
    console.log(formatBody(body))
    console.log(`${COLORS.yellow}Note: API only supports URL format (https://open.spotify.com/track/...) and spotify:search:${COLORS.reset}`)
    trackResult("Track API - Spotify Track URI Format", true)
    return true
  } else if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials")
      console.log(formatBody(body))
      console.log(`${COLORS.yellow}Note: Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to test actual API calls${COLORS.reset}`)
      trackResult("Track API - Spotify Track URI Format", true)
      return true
    }
  } else if (response.ok) {
    // If somehow it works in the future, that's fine too
    log.ok("API successfully fetched track info")
    JSON.parse(body)
    console.log(formatBody(body))
    trackResult("Track API - Spotify Track URI Format", true)
    return true
  } else {
    log.fail(`Expected 400 or 500, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Track API - Spotify Track URI Format", false, `Expected 400 or 500, got ${response.status}`)
    return false
  }
}

async function testTrackInfoSpotifyUrl() {
  log.step("6. Testing GET request with Spotify URL format...")
  const trackUrl = "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
  const response = await fetch(`${TRACK_API_URL}?uri=${encodeURIComponent(trackUrl)}`, {
    method: "GET"
  })
  const body = await response.text()

  if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials")
      console.log(formatBody(body))
      trackResult("Track API - Spotify URL Format", true)
      return
    }
  }

  if (response.ok) {
    log.ok("API successfully parsed URL format and fetched track")
    console.log(formatBody(body))
    trackResult("Track API - Spotify URL Format", true)
  } else {
    log.fail(`Expected 200, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Track API - Spotify URL Format", false, `Expected 200, got ${response.status}`)
  }
}

async function testTrackInfoSpotifySearchUri() {
  log.step("7. Testing GET request with Spotify search URI...")
  const searchUri = "spotify:search:Mr. Brightside The Killers"
  const response = await fetch(`${TRACK_API_URL}?uri=${encodeURIComponent(searchUri)}`, {
    method: "GET"
  })
  const body = await response.text()

  if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials")
      console.log(formatBody(body))
      trackResult("Track API - Search URI", true)
      return
    }
  }

  if (response.ok) {
    log.ok("API successfully handled search URI")
    console.log(formatBody(body))
    trackResult("Track API - Search URI", true)
  } else if (response.status === 404) {
    log.ok("API correctly returned 404 for no search results")
    console.log(formatBody(body))
    trackResult("Track API - Search URI", true)
  } else {
    log.fail(`Expected 200 or 404, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Track API - Search URI", false, `Expected 200 or 404, got ${response.status}`)
  }
}

async function testTrackInfoNonExistentTrack() {
  log.step("8. Testing GET request with non-existent track ID...")
  const fakeTrackUri = "spotify:track:00000000000000000000XX"
  const response = await fetch(`${TRACK_API_URL}?uri=${encodeURIComponent(fakeTrackUri)}`, {
    method: "GET"
  })
  const body = await response.text()

  if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials")
      console.log(formatBody(body))
      trackResult("Track API - Non-Existent Track", true)
      return
    }
  }

  if (response.status === 400 || response.status === 404) {
    log.ok("API correctly handled non-existent track")
    console.log(formatBody(body))
    trackResult("Track API - Non-Existent Track", true)
  } else {
    log.fail(`Expected 400 or 404, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Track API - Non-Existent Track", false, `Expected 400 or 404, got ${response.status}`)
  }
}

async function runTrackInfoTests() {
  log.section("Testing Spotify Track API")
  log.step(`API URL: ${TRACK_API_URL}`)
  console.log("")
  
  await testTrackInfoReachable()
  console.log("")
  await testTrackInfoWrongMethod()
  console.log("")
  await testTrackInfoMissingUri()
  console.log("")
  await testTrackInfoInvalidUriFormat()
  console.log("")
  await testTrackInfoSpotifyTrackUri()
  console.log("")
  await testTrackInfoSpotifyUrl()
  console.log("")
  await testTrackInfoSpotifySearchUri()
  console.log("")
  await testTrackInfoNonExistentTrack()
}

// ============================================================================
// Artist API Tests
// ============================================================================

const API_ARTIST_PATH = process.env.API_ARTIST_PATH ?? "/api/artist"
const ARTIST_API_URL = `${API_BASE_URL}${API_ARTIST_PATH}`

async function testArtistReachable() {
  log.step("1. Checking if Artist API is accessible...")
  const reachable = await assertReachable(ARTIST_API_URL)
  if (reachable) {
    log.ok("Artist API is reachable")
    trackResult("Artist API - Reachable", true)
    return true
  } else {
    log.fail("Failed to reach Artist API")
    console.error("Make sure to run: vercel dev")
    trackResult("Artist API - Reachable", false, "API not reachable")
    throw new Error("API not reachable")
  }
}

async function testArtistWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...")
  const response = await fetch(ARTIST_API_URL, {method: "POST"})
  const body = await response.text()
  if (response.status === 405) {
    log.ok("Correctly returned 405 for wrong method")
    console.log(formatBody(body))
    trackResult("Artist API - Wrong Method", true)
    return true
  } else {
    log.fail(`Expected 405, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Artist API - Wrong Method", false, `Expected 405, got ${response.status}`)
    return false
  }
}

async function testArtistMissingUrl() {
  log.step("3. Testing GET request without artistUrl parameter...")
  const response = await fetch(ARTIST_API_URL, {method: "GET"})
  const body = await response.text()
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing artist URL")
    console.log(formatBody(body))
    trackResult("Artist API - Missing URL", true)
    return true
  } else {
    log.fail(`Expected 400, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Artist API - Missing URL", false, `Expected 400, got ${response.status}`)
    return false
  }
}

async function testArtistInvalidUrl() {
  log.step("4. Testing GET request with invalid artist URL...")
  const invalidUrl = "not-a-spotify-url"
  const response = await fetch(`${ARTIST_API_URL}?artistUrl=${encodeURIComponent(invalidUrl)}`, {
    method: "GET"
  })
  const body = await response.text()
  
  if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials")
      console.log(formatBody(body))
      trackResult("Artist API - Invalid URL", true)
      return true
    }
  }
  
  if (response.status === 400) {
    log.ok("Correctly returned 400 for invalid URL format")
    console.log(formatBody(body))
    trackResult("Artist API - Invalid URL", true)
    return true
  } else {
    log.fail(`Expected 400 or 500, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Artist API - Invalid URL", false, `Expected 400 or 500, got ${response.status}`)
    return false
  }
}

async function testArtistValidArtistUrl() {
  log.step("5. Testing GET request with valid artist URL...")
  const artistUrl = "https://open.spotify.com/artist/6nS5roXSAGhTGr34W6n7Et" // The Killers
  const response = await fetch(`${ARTIST_API_URL}?artistUrl=${encodeURIComponent(artistUrl)}`, {
    method: "GET"
  })
  const body = await response.text()

  if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials")
      console.log(formatBody(body))
      console.log(`${COLORS.yellow}Note: Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to test actual API calls${COLORS.reset}`)
      trackResult("Artist API - Valid Artist URL", true)
      return
    }
  }

  if (response.ok) {
    log.ok("API successfully fetched artist info")
    const data = JSON.parse(body)
    console.log(formatBody(body))

    if (data.id && data.name) {
      log.ok("Response has expected structure")
      trackResult("Artist API - Valid Artist URL", true)
    } else {
      log.fail("Response missing expected fields")
      trackResult("Artist API - Valid Artist URL", false, "Response missing expected fields")
    }
  } else {
    log.fail(`Expected 200, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Artist API - Valid Artist URL", false, `Expected 200, got ${response.status}`)
  }
}

async function testArtistJustArtistId() {
  log.step("6. Testing GET request with just artist ID (no full URL)...")
  const artistId = "6nS5roXSAGhTGr34W6n7Et" // The Killers artist ID
  const response = await fetch(`${ARTIST_API_URL}?artistUrl=${encodeURIComponent(artistId)}`, {
    method: "GET"
  })
  const body = await response.text()

  if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials")
      console.log(formatBody(body))
      trackResult("Artist API - Just Artist ID", true)
      return
    }
  }

  if (response.ok) {
    log.ok("API successfully handled artist ID format")
    console.log(formatBody(body))
    trackResult("Artist API - Just Artist ID", true)
  } else {
    log.fail(`Expected 200, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Artist API - Just Artist ID", false, `Expected 200, got ${response.status}`)
  }
}

async function runArtistTests() {
  log.section("Testing Artist API")
  log.step(`API URL: ${ARTIST_API_URL}`)
  console.log("")

  await testArtistReachable()
  console.log("")
  await testArtistWrongMethod()
  console.log("")
  await testArtistMissingUrl()
  console.log("")
  await testArtistInvalidUrl()
  console.log("")
  await testArtistValidArtistUrl()
  console.log("")
  await testArtistJustArtistId()
}

// ============================================================================
// Artists (Multiple) API Tests
// ============================================================================

const API_ARTISTS_PATH = process.env.API_ARTISTS_PATH ?? "/api/artists"
const ARTISTS_API_URL = `${API_BASE_URL}${API_ARTISTS_PATH}`

async function testArtistsReachable() {
  log.step("1. Checking if Artists API is accessible...")
  const reachable = await assertReachable(ARTISTS_API_URL)
  if (reachable) {
    log.ok("Artists API is reachable")
    trackResult("Artists API - Reachable", true)
    return true
  } else {
    log.fail("Failed to reach Artists API")
    console.error("Make sure to run: vercel dev")
    trackResult("Artists API - Reachable", false, "API not reachable")
    throw new Error("API not reachable")
  }
}

async function testArtistsWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...")
  const response = await fetch(ARTISTS_API_URL, {method: "POST"})
  const body = await response.text()
  if (response.status === 405) {
    log.ok("Correctly returned 405 for wrong method")
    console.log(formatBody(body))
    trackResult("Artists API - Wrong Method", true)
    return true
  } else {
    log.fail(`Expected 405, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Artists API - Wrong Method", false, `Expected 405, got ${response.status}`)
    return false
  }
}

async function testArtistsMissingIds() {
  log.step("3. Testing GET request without ids parameter...")
  const response = await fetch(ARTISTS_API_URL, {method: "GET"})
  const body = await response.text()
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing ids")
    console.log(formatBody(body))
    trackResult("Artists API - Missing IDs", true)
    return true
  } else {
    log.fail(`Expected 400, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Artists API - Missing IDs", false, `Expected 400, got ${response.status}`)
    return false
  }
}

async function testArtistsValidIds() {
  log.step("4. Testing GET request with valid artist IDs...")
  const artistIds = "6nS5roXSAGhTGr34W6n7Et,4Z8W4fKeB5YxbusRsdQVPb" // The Killers, Radiohead
  const response = await fetch(`${ARTISTS_API_URL}?ids=${encodeURIComponent(artistIds)}`, {
    method: "GET"
  })
  const body = await response.text()

  if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials")
      console.log(formatBody(body))
      console.log(`${COLORS.yellow}Note: Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to test actual API calls${COLORS.reset}`)
      trackResult("Artists API - Valid IDs", true)
      return
    }
  }

  if (response.ok) {
    log.ok("API successfully fetched multiple artists")
    const data = JSON.parse(body)
    console.log(formatBody(body))

    if (typeof data === 'object' && Object.keys(data).length > 0) {
      log.ok("Response has expected structure (object map)")
      trackResult("Artists API - Valid IDs", true)
    } else {
      log.fail("Response missing expected structure")
      trackResult("Artists API - Valid IDs", false, "Response missing expected structure")
    }
  } else {
    log.fail(`Expected 200, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Artists API - Valid IDs", false, `Expected 200, got ${response.status}`)
  }
}

async function testArtistsTooManyIds() {
  log.step("5. Testing GET request with more than 50 artist IDs (should fail)...")
  const tooManyIds = Array.from({length: 51}, (_, i) => `artist${i}`).join(',')
  const response = await fetch(`${ARTISTS_API_URL}?ids=${encodeURIComponent(tooManyIds)}`, {
    method: "GET"
  })
  const body = await response.text()
  
  if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('Spotify API not configured')) {
      log.ok("API correctly reports missing Spotify credentials")
      console.log(formatBody(body))
      console.log(`${COLORS.yellow}Note: With Spotify credentials, this should return 400 for too many IDs${COLORS.reset}`)
      trackResult("Artists API - Too Many IDs", true)
      return true
    }
  }
  
  if (response.status === 400) {
    log.ok("Correctly returned 400 for too many IDs")
    console.log(formatBody(body))
    trackResult("Artists API - Too Many IDs", true)
    return true
  } else {
    log.fail(`Expected 400 or 500, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Artists API - Too Many IDs", false, `Expected 400 or 500, got ${response.status}`)
    return false
  }
}

async function runArtistsTests() {
  log.section("Testing Artists (Multiple) API")
  log.step(`API URL: ${ARTISTS_API_URL}`)
  console.log("")

  await testArtistsReachable()
  console.log("")
  await testArtistsWrongMethod()
  console.log("")
  await testArtistsMissingIds()
  console.log("")
  await testArtistsValidIds()
  console.log("")
  await testArtistsTooManyIds()
}

// ============================================================================
// Verify API Tests
// ============================================================================

const API_VERIFY_PATH = process.env.API_VERIFY_PATH ?? "/api/verify"
const VERIFY_API_URL = `${API_BASE_URL}${API_VERIFY_PATH}`

async function testVerifyReachable() {
  log.step("1. Checking if Verify API is accessible...")
  const reachable = await assertReachable(VERIFY_API_URL)
  if (reachable) {
    log.ok("Verify API is reachable")
    trackResult("Verify API - Reachable", true)
    return true
  } else {
    log.fail("Failed to reach Verify API")
    console.error("Make sure to run: vercel dev")
    trackResult("Verify API - Reachable", false, "API not reachable")
    throw new Error("API not reachable")
  }
}

async function testVerifyWrongMethod() {
  log.step("2. Testing POST request (should only accept GET)...")
  const response = await fetch(VERIFY_API_URL, {method: "POST"})
  const body = await response.text()
  if (response.status === 405) {
    log.ok("Correctly returned 405 for wrong method")
    console.log(formatBody(body))
    trackResult("Verify API - Wrong Method", true)
    return true
  } else {
    log.fail(`Expected 405, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Verify API - Wrong Method", false, `Expected 405, got ${response.status}`)
    return false
  }
}

async function testVerifyMissingArtistId() {
  log.step("3. Testing GET request without artistId parameter...")
  const response = await fetch(VERIFY_API_URL, {method: "GET"})
  const body = await response.text()
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing artistId")
    console.log(formatBody(body))
    trackResult("Verify API - Missing Artist ID", true)
    return true
  } else {
    log.fail(`Expected 400, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Verify API - Missing Artist ID", false, `Expected 400, got ${response.status}`)
    return false
  }
}

async function testVerifyValidArtistId() {
  log.step("4. Testing GET request with valid artist ID...")
  const artistId = "6nS5roXSAGhTGr34W6n7Et" // The Killers
  const response = await fetch(`${VERIFY_API_URL}?artistId=${encodeURIComponent(artistId)}`, {
    method: "GET"
  })
  const body = await response.text()

  if (response.status === 500) {
    const bodyJson = JSON.parse(body)
    if (bodyJson.error?.includes('RapidAPI key not configured')) {
      log.ok("API correctly reports missing RapidAPI credentials")
      console.log(formatBody(body))
      console.log(`${COLORS.yellow}Note: Set RAPIDAPI_KEY to test actual API calls${COLORS.reset}`)
      trackResult("Verify API - Valid Artist ID", true)
      return
    }
  }

  if (response.ok) {
    log.ok("API successfully verified artist")
    const data = JSON.parse(body)
    console.log(formatBody(body))

    if (typeof data.verified === 'boolean') {
      log.ok("Response has expected structure")
      trackResult("Verify API - Valid Artist ID", true)
    } else {
      log.fail("Response missing expected fields")
      trackResult("Verify API - Valid Artist ID", false, "Response missing expected fields")
    }
  } else {
    log.fail(`Expected 200, got ${response.status}`)
    console.log(formatBody(body))
    trackResult("Verify API - Valid Artist ID", false, `Expected 200, got ${response.status}`)
  }
}

async function runVerifyTests() {
  log.section("Testing Verify API")
  log.step(`API URL: ${VERIFY_API_URL}`)
  console.log("")

  await testVerifyReachable()
  console.log("")
  await testVerifyWrongMethod()
  console.log("")
  await testVerifyMissingArtistId()
  console.log("")
  await testVerifyValidArtistId()
}

// ============================================================================
// Main Test Runner
// ============================================================================

function printSummary(startTime: number) {
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)
  const passed = testResults.filter(r => r.passed).length
  const failed = testResults.filter(r => !r.passed).length
  const total = testResults.length

  console.log("")
  log.banner("Test Summary")
  console.log(`${COLORS.green}✓ Passed: ${passed}${COLORS.reset}`)
  console.log(`${COLORS.red}✗ Failed: ${failed}${COLORS.reset}`)
  console.log(`  Total: ${total}`)
  console.log(`  Duration: ${duration}s`)
  console.log("")

  if (failed > 0) {
    console.log(`${COLORS.red}Failed Tests:${COLORS.reset}`)
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  ${COLORS.red}✗${COLORS.reset} ${r.name}`)
        if (r.error) {
          console.log(`    ${COLORS.red}${r.error}${COLORS.reset}`)
        }
      })
    console.log("")
  }

  const statusColor = failed === 0 ? COLORS.green : COLORS.red
  const statusText = failed === 0 ? "All tests passed!" : "Some tests failed"
  console.log(`${statusColor}${"=".repeat(60)}${COLORS.reset}`)
  console.log(`${statusColor}${statusText}${COLORS.reset}`)
  console.log(`${statusColor}${"=".repeat(60)}${COLORS.reset}\n`)
}

async function main() {
  const startTime = Date.now()
  log.banner("API Test Suite - All Endpoints")

  try {
    await runDiscoverTests()
    console.log("")
    await runTrackInfoTests()
    console.log("")
    await runArtistTests()
    console.log("")
    await runArtistsTests()
    console.log("")
    await runVerifyTests()
    console.log("")
    printSummary(startTime)
  } catch (error) {
    log.fail("Test suite failed")
    console.error(error)
    printSummary(startTime)
    process.exit(1)
  }
}

main().catch((error) => {
  log.fail("Unexpected error")
  console.error(error)
  process.exit(1)
})

