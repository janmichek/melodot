import {useCallback, useEffect, useRef, useState} from "react"
import {useAudioRecorder} from "@/hooks/useAudio"
import DiscoveryButton from "@/components/DiscoveryButton"
import {Button} from "@/components/ui/button"
import {Alert, AlertDescription} from "@/components/ui/alert"
import type {AudioRecorderProps, TrackInfoResponse} from "@types"

const ATTEMPT_DURATIONS = [3, 5, 10, 15] // seconds for each attempt

export default function DiscoveryRecorder({onDiscoveryComplete}: AudioRecorderProps) {
  const {
    permission,
    audioBlob,
    errorMessage,
    isRecording,
    enablePermission,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder()

  const [duration, setDuration] = useState(0)
  const [attemptIndex, setAttemptIndex] = useState(0)
  const [allAttemptsFailed, setAllAttemptsFailed] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const isProcessingAttempt = useRef(false)
  const pendingRecordingStart = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const startNextAttempt = useCallback(() => {
    isProcessingAttempt.current = false

    if (attemptIndex < ATTEMPT_DURATIONS.length - 1) {
      const nextAttempt = attemptIndex + 1
      setAttemptIndex(nextAttempt)
      setDuration(0)
      resetRecording()
      setTimeout(() => startRecording(), 100)
    } else {
      setAllAttemptsFailed(true)
      setIsDiscovering(false)
      stopRecording()
    }
  }, [attemptIndex, resetRecording, startRecording, stopRecording])

  const discover = useCallback(async () => {
    if (isProcessingAttempt.current) {return}
    isProcessingAttempt.current = true
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const formData = new FormData()
      if (!audioBlob) {
        isProcessingAttempt.current = false
        abortControllerRef.current = null
        return
      }
      formData.append("file", audioBlob, "recording.webm")

      const response = await fetch("/api/discover", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data && data.track) {
        const spotifyProvider = data.track?.hub?.providers?.find(
          (provider: { type: string }) => provider.type === "SPOTIFY"
        )

        const spotifyDeeplink = spotifyProvider?.actions?.find(
          (action: { type: string }) => action.type === "uri"
        )?.uri

        if (spotifyDeeplink) {
          try {
            const spotifyResponse = await fetch(
              `/api/track?uri=${encodeURIComponent(spotifyDeeplink)}`,
              {signal: controller.signal}
            )
            if (spotifyResponse.ok) {
              const spotifyInfo = await spotifyResponse.json() as TrackInfoResponse
              data.spotifyInfo = {
                artists: spotifyInfo.artists,
                previewUrl: spotifyInfo.previewUrl ?? null,
              }
            } else {
              const error = await spotifyResponse.text()
              console.error("Spotify API error:", error)
            }
          } catch (error) {
            // If aborted, just exit gracefully
            if (error && typeof error === "object" && "name" in error && (error as { name?: string }).name === "AbortError") {
              abortControllerRef.current = null
              isProcessingAttempt.current = false
              return
            }
            console.error("Failed to fetch Spotify info:", error)
            // Continue without Spotify info
          }
        }

        onDiscoveryComplete(data)
        isProcessingAttempt.current = false
        abortControllerRef.current = null
        // Don't reset here - let the parent component handle the state transition
        return
      }

      startNextAttempt()
    } catch (error) {
      // If the user aborted discovery, do not start next attempt
      if (error && typeof error === "object" && "name" in error && (error as { name?: string }).name === "AbortError") {
        abortControllerRef.current = null
        isProcessingAttempt.current = false
        setIsDiscovering(false)
        return
      }
      startNextAttempt()
    }
  }, [audioBlob, onDiscoveryComplete, startNextAttempt])

  // Discover audio when ready
  useEffect(() => {
    if (isDiscovering && audioBlob && !isProcessingAttempt.current) {
      void discover()
    }
  }, [isDiscovering, audioBlob, discover])

  // Timer effect that tracks recording duration
  useEffect(() => {
    if (!isRecording) {return}

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording])

  // Auto-start recording when permission is granted after user clicked record
  useEffect(() => {
    if (permission && pendingRecordingStart.current && !isRecording && !isDiscovering) {
      pendingRecordingStart.current = false
      setAttemptIndex(0)
      setAllAttemptsFailed(false)
      setDuration(0)
      isProcessingAttempt.current = false
      startRecording()
    }
  }, [permission, isRecording, isDiscovering, startRecording])

  // Auto-stop recording when duration threshold is reached for current attempt
  useEffect(() => {
    if (isRecording && !isProcessingAttempt.current) {
      const targetDuration = ATTEMPT_DURATIONS[attemptIndex]

      if (duration >= targetDuration) {
        setIsDiscovering(true)
        stopRecording()
      }
    }
  }, [duration, isRecording, attemptIndex, stopRecording])

  async function record() {
    if (!isRecording && !isDiscovering) {
      // If no permission, request it first
      if (!permission) {
        pendingRecordingStart.current = true
        await enablePermission()
        // Recording will start automatically via useEffect when permission is granted
        return
      }

      // Start recording if we already have permission
      setAttemptIndex(0)
      setAllAttemptsFailed(false)
      setDuration(0)
      isProcessingAttempt.current = false
      startRecording()
    }
  }

  function stop() {
    // Stop active recording if any
    if (isRecording) {
      stopRecording()
    }
    // Abort in-flight discovery/analyzing requests if any
    if (isDiscovering || isProcessingAttempt.current) {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
    }
    setIsDiscovering(false)
    reset()
  }

  function reset() {
    setIsDiscovering(false)
    setDuration(0)
    setAttemptIndex(0)
    setAllAttemptsFailed(false)
    isProcessingAttempt.current = false
    pendingRecordingStart.current = false
    resetRecording()
  }

  return (
    <div className="shazam-container flex w-full flex-col items-center justify-center gap-6">
      {!allAttemptsFailed && (
        <DiscoveryButton
          hasPermission={permission}
          isRecording={isRecording}
          isDiscovering={isDiscovering}
          onStart={record}
          onStop={stop}/>
      )}

      {allAttemptsFailed && (
        <Alert variant="destructive" className="w-full max-w-md text-center">
          <AlertDescription className="mb-4">
            No match found after {ATTEMPT_DURATIONS.length} attempts
          </AlertDescription>
          <Button onClick={reset} variant="secondary">
            Try Again
          </Button>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
