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
  const isCurrentlyRecording = hasPermission && isRecording && !isAnalyzing;
  const isReadyToRecord = hasPermission && !isRecording && !isAnalyzing;

  return (
    <div className="audio-player-container audio-player-recording-area">
      {!hasPermission && !isAnalyzing ? (
        <RecordButton
          hasPermission={false}
          onStart={onStart}
          onRequestPermission={onRequestPermission}
        />
      ) : null}
      {isReadyToRecord && (
        <RecordButton
          hasPermission={true}
          onStart={onStart}
          onRequestPermission={onRequestPermission}
        />
      )}
      {isCurrentlyRecording && <StopButton onClick={onStop} />}
    </div>
  );
}
