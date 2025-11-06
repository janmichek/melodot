import StopButton from "./StopButton";
import RecordButton from "./RecordButton";

interface AudioControlsProps {
  hasPermission: boolean;
  isRecording: boolean;
  isAnalyzing: boolean;
  onStart: () => void;
  onStop: () => void;
  onRequestPermission: () => void;
}

export default function AudioControls({
  hasPermission,
  isRecording,
  isAnalyzing,
  onStart,
  onStop,
  onRequestPermission,
}: AudioControlsProps) {
  const isCurrentlyRecording = hasPermission && isRecording;

  return (
    <div className="audio-player-container audio-player-recording-area">
      {!isCurrentlyRecording && !isAnalyzing ? (
        <RecordButton
          hasPermission={hasPermission}
          isRecording={isRecording}
          onStart={onStart}
          onRequestPermission={onRequestPermission}
        />
      ) : null}
      {isCurrentlyRecording && <StopButton onClick={onStop} />}
    </div>
  );
}
