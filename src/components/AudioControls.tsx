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
      {!isProcessing && (
        <RecordButton
          onStart={onStart}
        />
      )}
      {isProcessing && <StopButton onClick={onStop} />}
    </div>
  );
}
