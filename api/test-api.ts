const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:5173";
const API_ANALYZE_PATH =
  process.env.API_ANALYZE_PATH ?? "/api/analyze-audio";

const API_URL = process.argv[2] ?? `${API_BASE_URL}${API_ANALYZE_PATH}`;

type Logger = {
  banner: () => void;
  step: (msg: string) => void;
  ok: (msg: string) => void;
  fail: (msg: string) => void;
};

const log: Logger = {
  banner: () => {
    console.log(`${COLORS.yellow}Testing Audio Analysis API${COLORS.reset}`);
    console.log(`API URL: ${API_URL}\n`);
  },
  step: (msg) => console.log(`${COLORS.yellow}${msg}${COLORS.reset}`),
  ok: (msg) => console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`),
  fail: (msg) => console.error(`${COLORS.red}✗ ${msg}${COLORS.reset}`),
};

const SILENT_WAV = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x24, 0xf0, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
  0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02, 0x00, 0x10, 0x00,
  0x64, 0x61, 0x74, 0x61, 0x00, 0xf0, 0x00, 0x00,
]);

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

async function testMissingFile() {
  log.step("2. Testing POST request without file...");
  const response = await fetch(API_URL, { method: "POST" });
  const body = await response.text();
  if (response.status === 400) {
    log.ok("Correctly returned 400 for missing file");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 400, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function testWithAudio() {
  log.step("3. Testing POST request with audio file...");
  const formData = new FormData();
  formData.append(
    "file",
    new File([SILENT_WAV], "test-audio.wav", { type: "audio/wav" })
  );

  const response = await fetch(API_URL, { method: "POST", body: formData });
  const body = await response.text();

  if (response.ok) {
    log.ok("API successfully processed audio file");
    console.log(formatBody(body));
  } else {
    log.fail(`Expected 200, got ${response.status}`);
    console.log(formatBody(body));
  }
}

async function main() {
  log.banner();
  await assertReachable();
  console.log("");
  await testMissingFile();
  console.log("");
  await testWithAudio();
  console.log("");
  log.ok("Test complete");
}

main().catch((error) => {
  log.fail("Unexpected error");
  console.error(error);
  process.exit(1);
});

