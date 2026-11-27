import {useCallback, useRef, useState} from "react"
import type {AudioRecorderState} from "@types"

export const useAudioRecorder = () => {
  const [state, setState] = useState<AudioRecorderState>({
    mediaRecorder: null,
    audioBlob: null,
    permission: false,
    errorMessage: null,
    isRecording: false,
  })
  const audioChunksRef = useRef<Blob[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const enablePermission = useCallback(async () => {
    try {
      // Request with minimal, broadly-supported constraints for Chrome
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false,
      })

      // Pick a supported MIME type (Chrome prefers webm/opus; Firefox supports ogg/opus)
      const preferredMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ]
      const supportedMimeType = preferredMimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      )

      const mediaRecorder = new MediaRecorder(stream, {
        ...(supportedMimeType ? {mimeType: supportedMimeType} : {}),
        audioBitsPerSecond: 128000,
      })

      mediaRecorder.onstart = () => {
        setState((prev: AudioRecorderState) => ({...prev, isRecording: true}))
      }

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: supportedMimeType ?? "audio/webm",
        })
        setState((prev: AudioRecorderState) => ({
          ...prev,
          audioBlob,
          isRecording: false,
        }))
      }

      mediaRecorderRef.current = mediaRecorder
      setState((prev: AudioRecorderState) => ({
        ...prev,
        mediaRecorder,
        permission: true,
        errorMessage: null,
      }))

    } catch (error) {
      setState((prev: AudioRecorderState) => ({
        ...prev,
        permission: false,
        errorMessage: "Microphone permission denied",
      }))
      console.error("Error accessing microphone:", error)
    }
  }, [])

  const startRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state === 'inactive') {
      audioChunksRef.current = [] // Clear audio chunks on start
      recorder.start()
    }
  }, [])

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state === 'recording') {
      recorder.stop()
    }
  }, [])

  const resetRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder) {
      audioChunksRef.current = [] // Clear audio chunks
      if (recorder.state === 'recording') {
        recorder.stop()
      }
      setState((prev: AudioRecorderState) => ({
        ...prev,
        audioBlob: null,
        isRecording: false,
      }))
    }
  }, [])

  return {
    ...state,
    enablePermission,
    startRecording,
    stopRecording,
    resetRecording,
  }
}

