import { useState, useEffect } from "react";
import { useAudioRecorder } from "../hooks/audio";
import PermissionButton from "./PermissionButton";
import AudioPlayer from "./AudioPlayer";
import DiscoveryCard from "./DiscoveryCard";

export default function Shazam() {
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

  const [result, setResult] = useState((null));
  const [isCompleted, setIsCompleted] = useState(false);
  const [duration, setDuration] = useState(0);

  const submitAudioForAnalysis = async () => {
    try {
      const formData = new FormData();
      if (!audioBlob) return;
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch('/api/analyze-audio', { method: 'POST', body: formData, });
      console.log('response', response)
      if (!response.ok) {throw new Error(`HTTP error! status: ${response.status}`);}

      setResult((await response.json()));
      reset();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // Autosubmit after stop
  useEffect(() => {
    if (isCompleted && audioBlob) {
      void submitAudioForAnalysis();
    }
  }, [isCompleted, audioBlob]);

  // Timer effect that tracks recording duration
  useEffect(() => {
    return startDurationTimer(isRecording, setDuration);
  }, [isRecording]);

  const startStop = () => {
    if (!isRecording) {
      startRecording();
    } else {
      setIsCompleted(true);
      stopRecording();
    }
  };

  const reset = () => {
    setIsCompleted(false);
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
      {!permission && (
        <PermissionButton onRequestPermission={requestPermission} />
      )}
      <AudioPlayer
        isRecording={isRecording}
        isCompleted={isCompleted}
        duration={duration}
        audioBlob={audioBlob}
        onStartStop={startStop}
        onReset={reset}
      />
      <div className="shazam-content">
        {errorMessage && <p className="shazam-error">{errorMessage}</p>}
{/*todo explore result and print more if available*/}
        {result &&
          <DiscoveryCard result={result} />
        }
      </div>
    </div>
  );
}
