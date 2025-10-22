import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "../hooks/audio";
import AudioControls from "./AudioControls";
import { DiscoveryResult } from "../types";

const ATTEMPT_DURATIONS = [10, 15, 20]; // seconds for each attempt

interface AudioRecorderProps {
  onAnalysisComplete: (data: DiscoveryResult) => void;
}

export default function AudioRecorder({ onAnalysisComplete }: AudioRecorderProps) {
  const {
    permission,
    audioBlob,
    errorMessage,
    isRecording,
    requestPermission,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [attemptStatus, setAttemptStatus] = useState<string>("");
  const [allAttemptsFailed, setAllAttemptsFailed] = useState(false);
  const isProcessingAttempt = useRef(false);

  const submitAudioForAnalysis = async () => {
    if (isProcessingAttempt.current) return;
    isProcessingAttempt.current = true;

    console.log(`submitAudioForAnalysis - Attempt ${currentAttempt + 1}/${ATTEMPT_DURATIONS.length}`);
    setAttemptStatus(`Analyzing attempt ${currentAttempt + 1}...`);

    try {
      const formData = new FormData();
      if (!audioBlob) {
        isProcessingAttempt.current = false;
        return;
      }
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch('/api/analyze-audio', { method: 'POST', body: formData, });
      if (!response.ok) {throw new Error(`HTTP error! status: ${response.status}`);}

      const data = await response.json();
      console.log('Analysis complete - Full response:', data);
      console.log('Track structure:', JSON.stringify(data.track, null, 2));

      // Check if track was found
      if (data && data.track) {
        console.log('Track found! Stopping attempts.');
        onAnalysisComplete(data);
        reset();
        isProcessingAttempt.current = false;
        return;
      }

      // Track not found, try next attempt
      console.log('Track not found in this attempt');
      handleNextAttempt();
    } catch (error) {
      console.error("Error uploading file:", error);
      handleNextAttempt();
    }
  };

  const handleNextAttempt = () => {
    isProcessingAttempt.current = false;

    if (currentAttempt < ATTEMPT_DURATIONS.length - 1) {
      // Start next attempt
      const nextAttempt = currentAttempt + 1;
      console.log(`Starting attempt ${nextAttempt + 1} with ${ATTEMPT_DURATIONS[nextAttempt]}s duration`);
      setCurrentAttempt(nextAttempt);
      setAttemptStatus(`Attempt ${nextAttempt + 1}/${ATTEMPT_DURATIONS.length}`);
      setDuration(0);
      resetRecording();
      setTimeout(() => startRecording(), 100);
    } else {
      // All attempts failed
      console.log('All attempts failed');
      setAttemptStatus("No match found");
      setAllAttemptsFailed(true);
      setIsAnalyzing(false);
      stopRecording();
    }
  };

  // Autosubmit after stop
  useEffect(() => {
    if (isAnalyzing && audioBlob && !isProcessingAttempt.current) {
      void submitAudioForAnalysis();
    }
  }, [isAnalyzing, audioBlob]);

  // Timer effect that tracks recording duration
  useEffect(() => {
    return startDurationTimer(isRecording, setDuration);
  }, [isRecording]);

  // Auto-stop recording when duration threshold is reached for current attempt
  useEffect(() => {
    if (isRecording && !isProcessingAttempt.current) {
      const targetDuration = ATTEMPT_DURATIONS[currentAttempt];
      console.log(`Duration: ${duration}s / Target: ${targetDuration}s`);

      if (duration >= targetDuration) {
        console.log(`Reached ${targetDuration}s, stopping recording for analysis`);
        setIsAnalyzing(true);
        stopRecording();
      }
    }
  }, [duration, isRecording, currentAttempt]);

  const startStop = () => {
    if (!isRecording && !isAnalyzing) {
      // Start listening process
      setCurrentAttempt(0);
      setAttemptStatus(`Attempt 1/${ATTEMPT_DURATIONS.length}`);
      setAllAttemptsFailed(false);
      setDuration(0);
      isProcessingAttempt.current = false;
      startRecording();
    }
  };

  const reset = () => {
    setIsAnalyzing(false);
    setDuration(0);
    setCurrentAttempt(0);
    setAttemptStatus("");
    setAllAttemptsFailed(false);
    isProcessingAttempt.current = false;
    resetRecording();
  };

   // Helper function to manage duration timer interval
  function startDurationTimer(isRecording: boolean, setDuration: React.Dispatch<React.SetStateAction<number>>) {
    let interval: NodeJS.Timeout | null = null;

    if (isRecording) {
      interval = setInterval(() => {
        // Increment duration by 1 second every 1000ms
        setDuration((prevDuration: number) => prevDuration + 1);
      }, 1000);
    } else if (interval) {
      // Clear the interval when recording stops
      clearInterval(interval);
    }

    // Cleanup when component unmounts or dependencies change
    return () => {
      if (interval) clearInterval(interval);
    };
  }

  return (
    <div className="shazam-container">
      {(isRecording || isAnalyzing) && (
        <div className="attempt-info">
          <div className="attempt-status">{attemptStatus}</div>
          <div className="duration-display">{duration}s / {ATTEMPT_DURATIONS[currentAttempt]}s</div>
        </div>
      )}

      {allAttemptsFailed && (
        <div className="no-match-message">
          <p>No match found after {ATTEMPT_DURATIONS.length} attempts</p>
          <button onClick={reset} className="btn-secondary">Try Again</button>
        </div>
      )}

      {!allAttemptsFailed && (
        <AudioControls
          permission={permission}
          isRecording={isRecording || isAnalyzing}
          isAnalyzing={isAnalyzing}
          onStartStop={startStop}
          onRequestPermission={requestPermission}
        />
      )}

      {errorMessage && <p className="shazam-error">{errorMessage}</p>}
    </div>
  );
}
