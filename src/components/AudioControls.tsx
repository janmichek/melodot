import StopButton from "./StopButton";
import RecordButton from "./RecordButton";

interface AudioControlsProps {
  hasPermission: boolean;
  isRecording: boolean;
  isAnalyzing: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function AudioControls({
  hasPermission,
  isRecording,
  isAnalyzing,
  onStart,
  onStop,
}: AudioControlsProps) {
  const isProcessing = hasPermission && (isRecording || isAnalyzing);
  const isReadyToRecord = hasPermission && !isRecording && !isAnalyzing;

  return (
    <div className="audio-player-container audio-player-recording-area">
      <div className="audio-player-button-wrapper">
        <RecordButton
          onStart={onStart}
          className={isProcessing ? "audio-player-button-hidden" : "audio-player-button-visible"}
        />
        <StopButton 
          onClick={onStop}
          className={isProcessing ? "audio-player-button-visible" : "audio-player-button-hidden"}
        />
      </div>
    </div>
  );
}
