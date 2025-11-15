import {useEffect, useRef, useState} from "react";
import {useAudioRecorder} from "@/hooks/useAudio";
import AudioControls from "@/components/AudioControls";
import {DiscoveryResult} from "@/types";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";

const ATTEMPT_DURATIONS = [3, 5, 10, 15]; // seconds for each attempt

interface AudioRecorderProps {
  onAnalysisComplete: (data: DiscoveryResult) => void;
}

export default function AudioRecorder({ onAnalysisComplete }: AudioRecorderProps) {
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
  const [isDiscovering, setIsDiscovering] = useState(false);
  const isProcessingAttempt = useRef(false);
  const pendingRecordingStart = useRef(false);

  // Discover audio when ready
  useEffect(() => {
    if (isDiscovering && audioBlob && !isProcessingAttempt.current) {
      void discover();
    }
  }, [isDiscovering, audioBlob]);

  // Timer effect that tracks recording duration
  useEffect(() => {
    return startDurationTimer(isRecording, setDuration);
  }, [isRecording]);

  // Auto-start recording when permission is granted after user clicked record
  useEffect(() => {
    if (permission && pendingRecordingStart.current && !isRecording && !isDiscovering) {
      pendingRecordingStart.current = false;
      setAttemptIndex(0);
      setAllAttemptsFailed(false);
      setDuration(0);
      isProcessingAttempt.current = false;
      startRecording();
    }
  }, [permission, isRecording, isDiscovering, startRecording]);

  // Auto-stop recording when duration threshold is reached for current attempt
  useEffect(() => {
    if (isRecording && !isProcessingAttempt.current) {
      const targetDuration = ATTEMPT_DURATIONS[attemptIndex];

      if (duration >= targetDuration) {
        setIsDiscovering(true);
        stopRecording();
      }
    }
  }, [duration, isRecording, attemptIndex]);

  async function discover() {
    if (isProcessingAttempt.current) return;
    isProcessingAttempt.current = true;

    try {
      const formData = new FormData();
      if (!audioBlob) {
        isProcessingAttempt.current = false;
        return;
      }
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch("/api/discover", { method: "POST", body: formData });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.track) {
        const spotifyProvider = data.track?.hub?.providers?.find(
          (provider: { type: string }) => provider.type === "SPOTIFY"
        );

        const spotifyDeeplink = spotifyProvider?.actions?.find(
          (action: { type: string }) => action.type === "uri"
        )?.uri;

        if (spotifyDeeplink) {
          try {
            const spotifyResponse = await fetch(
              `/api/track?uri=${encodeURIComponent(spotifyDeeplink)}`
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
        isProcessingAttempt.current = false;
        // Don't reset here - let the parent component handle the state transition
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
      setIsDiscovering(false);
      stopRecording();
    }
  }

  async function record() {
    if (!isRecording && !isDiscovering) {
      // If no permission, request it first
      if (!permission) {
        pendingRecordingStart.current = true;
        await enablePermission();
        // Recording will start automatically via useEffect when permission is granted
        return;
      }

      // Start recording if we already have permission
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
      setIsDiscovering(false);
      reset();
    }
  }

  function reset() {
    setIsDiscovering(false);
    setDuration(0);
    setAttemptIndex(0);
    setAllAttemptsFailed(false);
    isProcessingAttempt.current = false;
    pendingRecordingStart.current = false;
    resetRecording();
  }

   // Helper function to manage duration timer interval
  function startDurationTimer(isRecording: boolean, setDuration: React.Dispatch<React.SetStateAction<number>>) {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prevDuration: number) => prevDuration + 1);
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
    <div className="shazam-container flex w-full flex-col items-center justify-center gap-6">
      {!allAttemptsFailed && (
        <AudioControls
          hasPermission={permission}
          isRecording={isRecording}
          isDiscovering={isDiscovering}
          onStart={record}
          onStop={stop}
        />
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
        <p className="shazam-error rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
