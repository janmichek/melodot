import StopButton from "./StopButton";
import RecordButton from "./RecordButton";
import PermissionButton from "./PermissionButton";

interface AudioControlsProps {
  permission: boolean;
  isRecording: boolean;
  isAnalyzing: boolean;
  onStart: () => void;
  onStop: () => void;
  onRequestPermission: () => void;
}

export default function AudioControls({
  permission,
  isRecording,
  isAnalyzing,
  onStart,
  onStop,
  onRequestPermission,
}: AudioControlsProps) {
  const isCurrentlyRecording = permission && isRecording;
  const isReadyToRecord = permission && !isRecording && !isAnalyzing;

  return (
    <div className="audio-player-container">
      <div className="audio-player-recording-area">
        {!permission && (<PermissionButton onRequestPermission={onRequestPermission} />)}
        {isReadyToRecord && (<RecordButton onClick={onStart} />)}
        {isCurrentlyRecording && (<StopButton onClick={onStop} />)}
        {isAnalyzing && (<div className="audio-player-analyzing">Analyzing ...</div>)}
      </div>
    </div>
  );
}
