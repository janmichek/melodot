import {useEffect, useRef, useState} from "react";
import {useAudioRecorder} from "../hooks/audio";
import AudioControls from "./AudioControls";
import {DiscoveryResult} from "../types";
import {Button} from "@/components/ui/button";

const ATTEMPT_DURATIONS = [2, 5, 10, 15]; // seconds for each attempt

interface AudioRecorderProps {
  onAnalysisComplete: (data: DiscoveryResult) => void;
}

export default function AudioRecorder({ onAnalysisComplete }: AudioRecorderProps) {
  const {
    audioBlob,
    errorMessage,
    isRecording,
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

      const response = await fetch('/api/analyze-audio', { method: 'POST', body: formData, });
      if (!response.ok) {throw new Error(`HTTP error! status: ${response.status}`);}

      const data = await response.json();

      if (data && data.track) {
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
      {!allAttemptsFailed && (
      <AudioControls
        isAnalyzing={isAnalyzing}
        onStart={record}
        onStop={stop}
      />
    )}

      {allAttemptsFailed && (
        <div className="no-match-message">
          <p>No match found after {ATTEMPT_DURATIONS.length} attempts</p>
          <Button onClick={reset} className="btn-secondary">Try Again</Button>
        </div>
      )}


      {errorMessage &&
        <p className="shazam-error">{errorMessage}</p>
      }
    </div>
  );
}
