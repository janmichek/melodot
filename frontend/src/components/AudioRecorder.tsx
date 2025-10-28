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
  const [allAttemptsFailed, setAllAttemptsFailed] = useState(false);
  const isProcessingAttempt = useRef(false);

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

  async function submitAudioForAnalysis() {
    if (isProcessingAttempt.current) return;
    isProcessingAttempt.current = true;

    console.log(`submitAudioForAnalysis - Attempt ${currentAttempt + 1}/${ATTEMPT_DURATIONS.length}`);

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

      if (data && data.track) {
        console.log('Track found! Stopping attempts.');
        onAnalysisComplete(data);
        reset();
        isProcessingAttempt.current = false;
        return;
      }

      console.log('Track not found in this attempt');
      handleNextAttempt();
    } catch (error) {
      console.error("Error uploading file:", error);
      handleNextAttempt();
    }
  }

  function handleNextAttempt() {
    isProcessingAttempt.current = false;

    if (currentAttempt < ATTEMPT_DURATIONS.length - 1) {
      const nextAttempt = currentAttempt + 1;
      console.log(`Starting attempt ${nextAttempt + 1} with ${ATTEMPT_DURATIONS[nextAttempt]}s duration`);
      setCurrentAttempt(nextAttempt);
      setDuration(0);
      resetRecording();
      setTimeout(() => startRecording(), 100);
    } else {
      setAllAttemptsFailed(true);
      setIsAnalyzing(false);
      stopRecording();
    }
  }

  function handleStartRecording() {
    if (!isRecording && !isAnalyzing) {
      setCurrentAttempt(0);
      setAllAttemptsFailed(false);
      setDuration(0);
      isProcessingAttempt.current = false;
      startRecording();
    }
  }

  function handleStopRecording() {
    if (isRecording) {
      stopRecording();
      setIsAnalyzing(false);
      reset();
    }
  }

  function reset() {
    setIsAnalyzing(false);
    setDuration(0);
    setCurrentAttempt(0);
    setAllAttemptsFailed(false);
    isProcessingAttempt.current = false;
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
    <div className="shazam-container">

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
          onStart={handleStartRecording}
          onStop={handleStopRecording}
          onRequestPermission={requestPermission}
        />
      )}

      {errorMessage && <p className="shazam-error">{errorMessage}</p>}
    </div>
  );
}
