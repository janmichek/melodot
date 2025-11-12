// @ts-check

/**
 * Basic metadata returned when a track is discovered.
 * @typedef {Object} DiscoveryTrack
 * @property {string=} title
 * @property {string=} subtitle
 * @property {{ coverart?: string }=} images
 * @property {{ type?: string, metadata?: Array<{ title?: string, text?: string }> }[]=} sections
 * @property {{ type: string, uri?: string }[]=} actions
 */

/**
 * Simplified discovery result used across the app.
 * @typedef {Object} DiscoveryResult
 * @property {DiscoveryTrack=} track
 * @property {{ socialLinks?: Record<string, string|undefined> }=} artistInfo
 * @property {{ album?: { name?: string, releaseDate?: string }, popularity?: number, durationMs?: number, artists?: Array<{ id: string, name: string, url?: string }> }=} spotifyInfo
 */

/**
 * Recorder state exposed by the audio hook.
 * @typedef {Object} AudioRecorderState
 * @property {MediaRecorder|null} mediaRecorder
 * @property {Blob|null} audioBlob
 * @property {boolean} permission
 * @property {string|null} errorMessage
 * @property {boolean} isRecording
 */

/**
 * Props accepted by the audio controls component.
 * @typedef {Object} AudioControlsProps
 * @property {boolean} hasPermission
 * @property {boolean} isRecording
 * @property {boolean} isAnalyzing
 * @property {() => void} onStart
 * @property {() => void} onStop
 * @property {() => void} onRequestPermission
 */

export {};


