import {clsx} from "clsx";
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
  const isProcessing = hasPermission && (isRecording || isAnalyzing);
  const isReadyToRecord = hasPermission && !isRecording && !isAnalyzing;
  const showRecordButton = !hasPermission || isReadyToRecord;
  const shouldRenderButton = showRecordButton || isProcessing;

  return (
    <div className="audio-player-container audio-player-recording-area">
      {shouldRenderButton ? (
        <div
          className={clsx(
            "audio-player-toggle-wrapper",
            isProcessing
              ? "audio-player-toggle-wrapper--recording"
              : "audio-player-toggle-wrapper--idle",
          )}
        >
          <RecordButton
            hasPermission={hasPermission}
            onStart={onStart}
            onRequestPermission={onRequestPermission}
            className={clsx(
              "audio-player-toggle-button",
              showRecordButton
                ? "audio-player-toggle-button-visible"
                : "audio-player-toggle-button-hidden",
            )}
            tabIndex={showRecordButton ? undefined : -1}
            ariaHidden={!showRecordButton}
          />
          <StopButton
            onClick={onStop}
            className={clsx(
              "audio-player-toggle-button",
              isProcessing
                ? "audio-player-toggle-button-visible"
                : "audio-player-toggle-button-hidden",
            )}
            tabIndex={isProcessing ? undefined : -1}
            ariaHidden={!isProcessing}
          />
        </div>
      ) : (
        <RecordButton
          hasPermission={hasPermission}
          onStart={onStart}
          onRequestPermission={onRequestPermission}
        />
      )}
    </div>
  );
}
