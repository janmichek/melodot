import {Buffer} from 'buffer'
import process from 'process'

// Web3Auth and some wallet SDKs read `window.process` / `window.Buffer` at
// module-evaluation time. Vite does not polyfill Node globals for the browser,
// and the old inline index.html shim did not survive the production build.
const globalWindow = window as typeof window & {
  Buffer?: typeof Buffer
  process?: typeof process
  global?: typeof globalThis
}

globalWindow.global ??= globalThis
globalWindow.Buffer ??= Buffer
globalWindow.process ??= process
