import StopButton from "./StopButton";
import RecordButton from "./RecordButton";
import PermissionButton from "./PermissionButton";

interface AudioControlsProps {
  permission: boolean;
  isRecording: boolean;
  isAnalyzing: boolean;
  onStartStop: () => void;
  onRequestPermission: () => void;
}

export default function AudioControls({
  permission,
  isRecording,
  isAnalyzing,
  onStartStop,
  onRequestPermission,
}: AudioControlsProps) {
  const isCurrentlyRecording = permission && isRecording;
  const isReadyToRecord = permission && !isRecording && !isAnalyzing;

  return (
    <div className="audio-player-container">
      <div className="audio-player-recording-area">
        {!permission && (<PermissionButton onRequestPermission={onRequestPermission} />)}
        {isCurrentlyRecording && (<StopButton onClick={onStartStop} />)}
        {isReadyToRecord && (<RecordButton onClick={onStartStop} />)}
        {isAnalyzing && (<div className="audio-player-analyzing">Analyzing ...</div>)}
      </div>
    </div>
  );
}
