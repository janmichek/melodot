import StopButton from "./StopButton";
import RecordButton from "./RecordButton";

interface AudioControlsProps {
  hasPermission: boolean;
  isRecording: boolean;
  isRecognizing: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function AudioControls({
  hasPermission,
  isRecording,
  isRecognizing,
  onStart,
  onStop,
}: AudioControlsProps) {
  const isProcessing = hasPermission && (isRecording || isRecognizing);
  const isReadyToRecord = hasPermission && !isRecording && !isRecognizing;

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
