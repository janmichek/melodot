import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "../hooks/audio";
import AudioControls from "./AudioControls";
import { DiscoveryResult } from "../types";
import { USE_MOCK_DATA, MOCK_DISCOVERY_DATA } from "./mockDiscoveryData";
import {Button} from "@/components/ui/button";

const ATTEMPT_DURATIONS = [2, 5, 10, 15]; // seconds for each attempt

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

    // ===== MOCK MODE: Return mock data immediately =====
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onAnalysisComplete(MOCK_DISCOVERY_DATA);
      reset();
      isProcessingAttempt.current = false;
      return;
    }
    // ===== END MOCK MODE =====

    // ===== REAL AUDIO ANALYSIS (currently disabled when USE_MOCK_DATA = true) =====
    // Uncomment this section and set USE_MOCK_DATA = false to restore real audio analysis
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
    // ===== END REAL AUDIO ANALYSIS =====
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

  // Mock mode: Skip recording and use mock data immediately
  function handleMockMode() {
    onAnalysisComplete(MOCK_DISCOVERY_DATA);
  }

  return (
    <div className="shazam-container">
      {/* Mock Mode Indicator */}
      {USE_MOCK_DATA && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          textAlign: 'center'
        }}>

          <Button
            onClick={handleMockMode}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Load Mock Track Data
          </Button>
          <p>
            To disable mock mode: Set USE_MOCK_DATA = false in mockDiscoveryData.ts
          </p>
        </div>
      )}

      {allAttemptsFailed && (
        <div className="no-match-message">
          <p>No match found after {ATTEMPT_DURATIONS.length} attempts</p>
          <Button onClick={reset} className="btn-secondary">Try Again</Button>
        </div>
      )}

      {!allAttemptsFailed && !USE_MOCK_DATA && (
        <AudioControls
          hasPermission={permission}
          isRecording={isRecording || isAnalyzing}
          isAnalyzing={isAnalyzing}
          onStart={record}
          onStop={stop}
          onRequestPermission={requestPermission}
        />
      )}

      {errorMessage &&
        <p className="shazam-error">{errorMessage}</p>
      }
    </div>
  );
}
