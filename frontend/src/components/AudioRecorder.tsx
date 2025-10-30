import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "../hooks/audio";
import AudioControls from "./AudioControls";
import { DiscoveryResult } from "../types";
import { USE_MOCK_DATA, MOCK_DISCOVERY_DATA } from "./mockDiscoveryData";

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

    // ===== MOCK MODE: Return mock data immediately =====
    if (USE_MOCK_DATA) {
      console.log('MOCK MODE: Using mock discovery data instead of real audio analysis');
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
    // ===== END REAL AUDIO ANALYSIS =====
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

  // Mock mode: Skip recording and use mock data immediately
  function handleMockMode() {
    console.log('MOCK MODE: Triggered manually');
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
          marginBottom: '15px',
          textAlign: 'center'
        }}>

          <button
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
          </button>
          <p style={{ color: '#856404' }}>
            To disable mock mode: Set USE_MOCK_DATA = false in mockDiscoveryData.ts
          </p>
        </div>
      )}

      {allAttemptsFailed && (
        <div className="no-match-message">
          <p>No match found after {ATTEMPT_DURATIONS.length} attempts</p>
          <button onClick={reset} className="btn-secondary">Try Again</button>
        </div>
      )}

      {!allAttemptsFailed && !USE_MOCK_DATA && (
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
