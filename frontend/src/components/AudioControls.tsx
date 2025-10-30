import StopButton from "./StopButton";
import RecordButton from "./RecordButton";
import PermissionButton from "./PermissionButton";

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
  const isReadyToRecord = hasPermission && !isRecording && !isAnalyzing;

  return (
    <div className="audio-player-container audio-player-recording-area">
      {!hasPermission && (<PermissionButton onRequestPermission={onRequestPermission} />)}
      {isReadyToRecord && (<RecordButton onClick={onStart} />)}
      {isCurrentlyRecording && (<StopButton onClick={onStop} />)}
      {/*{isAnalyzing && (<div className="audio-player-analyzing">Analyzing ...</div>)}*/}
    </div>
  );
}
