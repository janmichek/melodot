// @ts-check

import StopButton from "./StopButton";
import RecordButton from "./RecordButton";

/**
 * @param {{hasPermission: boolean, isRecording: boolean, isAnalyzing: boolean, onStart: () => void, onStop: () => void, onRequestPermission: () => void}} props
 */
export default function AudioControls({
  hasPermission,
  isRecording,
  isAnalyzing,
  onStart,
  onStop,
  onRequestPermission,
}) {
  const isProcessing = hasPermission && (isRecording || isAnalyzing);
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
      {isProcessing && <StopButton onClick={onStop} />}
    </div>
  );
}
