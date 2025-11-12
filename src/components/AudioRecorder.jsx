// @ts-check

import {useEffect, useRef, useState} from "react";
import {useAudioRecorder} from "../hooks/audio";
import AudioControls from "./AudioControls";
import {Button} from "@/components/ui/button";

/** @typedef {import("../types/index.js").DiscoveryResult} DiscoveryResult */

const ATTEMPT_DURATIONS = [2, 5, 10, 15]; // seconds for each attempt

/**
 * @param {{onAnalysisComplete: (data: DiscoveryResult) => void}} props
 */
export default function AudioRecorder({ onAnalysisComplete }) {
  const {
    permission,
    audioBlob,
    errorMessage,
    isRecording,
    enablePermission,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [duration, setDuration] = useState(0);
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [allAttemptsFailed, setAllAttemptsFailed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isProcessingAttempt = useRef(false);

  // Analyze audio when ready
  useEffect(() => {
    if (isAnalyzing && audioBlob && !isProcessingAttempt.current) {
      void analyze();
    }
  }, [isAnalyzing, audioBlob]);

  // Timer effect that tracks recording duration
  useEffect(() => {
    return startDurationTimer(isRecording, setDuration);
  }, [isRecording]);

  // Auto-stop recording when duration threshold is reached for current attempt
  useEffect(() => {
    if (isRecording && !isProcessingAttempt.current) {
      const targetDuration = ATTEMPT_DURATIONS[attemptIndex];

      if (duration >= targetDuration) {
        setIsAnalyzing(true);
        stopRecording();
      }
    }
  }, [duration, isRecording, attemptIndex]);

  async function analyze() {
    if (isProcessingAttempt.current) return;
    isProcessingAttempt.current = true;

    try {
      const formData = new FormData();
      if (!audioBlob) {
        isProcessingAttempt.current = false;
        return;
      }
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch("/api/analyze-audio", { method: "POST", body: formData });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      /** @type {DiscoveryResult} */
      const data = await response.json();

      if (data && data.track) {
        const spotifyProvider = data.track?.hub?.providers?.find(
          (provider) => provider.type === "SPOTIFY"
        );

        const spotifyDeeplink = spotifyProvider?.actions?.find(
          (action) => action.type === "uri"
        )?.uri;

        if (spotifyDeeplink) {
          try {
            const spotifyResponse = await fetch(
              `/api/spotify/track/info?uri=${encodeURIComponent(spotifyDeeplink)}`
            );
            if (spotifyResponse.ok) {
              const spotifyInfo = await spotifyResponse.json();
              data.spotifyInfo = spotifyInfo;
            } else {
              const error = await spotifyResponse.text();
              console.error("Spotify API error:", error);
            }
          } catch (error) {
            console.error("Failed to fetch Spotify info:", error);
            // Continue without Spotify info
          }
        }

        onAnalysisComplete(data);
        reset();
        isProcessingAttempt.current = false;
        return;
      }

      startNextAttempt();
    } catch (error) {
      startNextAttempt();
    }
  }

  function startNextAttempt() {
    isProcessingAttempt.current = false;

    if (attemptIndex < ATTEMPT_DURATIONS.length - 1) {
      const nextAttempt = attemptIndex + 1;
      setAttemptIndex(nextAttempt);
      setDuration(0);
      resetRecording();
      setTimeout(() => startRecording(), 100);
    } else {
      setAllAttemptsFailed(true);
      setIsAnalyzing(false);
      stopRecording();
    }
  }

  function record() {
    if (!isRecording && !isAnalyzing) {
      setAttemptIndex(0);
      setAllAttemptsFailed(false);
      setDuration(0);
      isProcessingAttempt.current = false;
      startRecording();
    }
  }

  function stop() {
    if (isRecording) {
      stopRecording();
      setIsAnalyzing(false);
      reset();
    }
  }

  function reset() {
    setIsAnalyzing(false);
    setDuration(0);
    setAttemptIndex(0);
    setAllAttemptsFailed(false);
    isProcessingAttempt.current = false;
    resetRecording();
  }

   // Helper function to manage duration timer interval
  /**
   * Manage the interval that tracks recording duration.
   * @param {boolean} isRecording
   * @param {(updater: (value: number) => number) => void} setDuration
   */
  function startDurationTimer(isRecording, setDuration) {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    // Cleanup when component unmounts or dependencies change
    return () => {
      if (interval) clearInterval(interval);
    };
  }

  return (
    <div className="shazam-container flex w-full flex-col items-center gap-6">
      {!allAttemptsFailed && (
        <AudioControls
          hasPermission={permission}
          isRecording={isRecording}
          isAnalyzing={isAnalyzing}
          onStart={record}
          onStop={stop}
          onRequestPermission={enablePermission}
        />
      )}

      {allAttemptsFailed && (
        <div className="w-full max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            No match found after {ATTEMPT_DURATIONS.length} attempts
          </p>
          <Button onClick={reset} variant="secondary">
            Try Again
          </Button>
        </div>
      )}

      {errorMessage && (
        <p className="shazam-error rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
