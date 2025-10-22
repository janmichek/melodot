import { useState, useEffect } from "react";
import { useAudioRecorder } from "../hooks/audio";
import AudioControls from "./AudioControls";
import { DiscoveryResult } from "../types";

export default function AudioRecorder({ onAnalysisComplete }: { onAnalysisComplete: (data: DiscoveryResult) => void }) {
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

  const submitAudioForAnalysis = async () => {
    console.log('submitAudioForAnalysis')
    try {
      const formData = new FormData();
      if (!audioBlob) return;
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch('/api/analyze-audio', { method: 'POST', body: formData, });
      if (!response.ok) {throw new Error(`HTTP error! status: ${response.status}`);}

      const data = await response.json();
      console.log('Analysis complete - Full response:', data);
      console.log('Track structure:', JSON.stringify(data.track, null, 2));
      onAnalysisComplete(data);
      reset();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // Autosubmit after stop
  useEffect(() => {
    if (isAnalyzing && audioBlob) {
      void submitAudioForAnalysis();
    }
  }, [isAnalyzing, audioBlob]);

  // Timer effect that tracks recording duration
  useEffect(() => {
    return startDurationTimer(isRecording, setDuration);
  }, [isRecording]);

  useEffect(() => {
    console.log('duration', duration)
    if(duration > 10) {
      void submitAudioForAnalysis();
    }
  }, [duration]);

  const startStop = () => {
    if (!isRecording) {
      startRecording();
    } else {
      setIsAnalyzing(true);
      stopRecording();
    }
  };

  const reset = () => {
    setIsAnalyzing(false);
    setDuration(0);
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
      <div className="duration-display">{duration}s</div>
      <AudioControls
        permission={permission}
        isRecording={isRecording}
        isAnalyzing={isAnalyzing}
        onStartStop={startStop}
        onRequestPermission={requestPermission}
      />
      {errorMessage && <p className="shazam-error">{errorMessage}</p>}
    </div>
  );
}
