import StopButton from "./StopButton";
import RecordButton from "./RecordButton";
import {useAudioRecorder} from "@/hooks/audio";

interface AudioControlsProps {
  isAnalyzing: boolean;
  onStart: () => void;
  onStop: () => void;
}


export default function AudioControls({isAnalyzing, onStart, onStop,}: AudioControlsProps) {
  const {
    permission,
    enablePermission,
  } = useAudioRecorder();

  const isCurrentlyRecording = permission && !isAnalyzing;

  return (
    <div className="audio-player-container audio-player-recording-area">
      {!isCurrentlyRecording && !isAnalyzing ? (
        <RecordButton
          hasPermission={permission}
          onStart={onStart}
          onRequestPermission={enablePermission}
        />
      ) : null}
      {isCurrentlyRecording && <StopButton onClick={onStop} />}
    </div>
  );
}
