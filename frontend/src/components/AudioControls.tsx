import { Mic, Square } from "lucide-react";

interface AudioPlayerProps {
  isRecording: boolean;
  isCompleted: boolean;
  duration?: number;
  audioBlob?: Blob | null;
  onStartStop: () => void;
  onReset: () => void;
}

// todo check this component fo unused props and remove
export default function AudioControls({
  isRecording,
  isCompleted,
  duration: _duration,
  audioBlob: _audioBlob,
  onStartStop,
  onReset: _onReset
}: AudioPlayerProps) {
  return (
    <div className="audio-player-container">
      <div className="audio-player-recording-area">
        {/*todo move permissionButton here. UX-wise it will display only one button at the time*/}
        {isRecording && (
          <button
            onClick={onStartStop}
            className="audio-player-button"
          >
            {/*todo componentize to separate stopButton.tsx*/}
            <div className="audio-player-recording-pulse"></div>
            <div className="audio-player-button-inner audio-player-recording-bg">
              <Square className="audio-player-icon" />
            </div>
          </button>
        )}
        {!isRecording && !isCompleted && (
          // todo componentize to separate recordButton.tsx
          <button
            onClick={onStartStop}
            className="audio-player-button"
            aria-label="Start recording"
          >
            <div className="audio-player-button-inner audio-player-start-bg">
              <Mic className="audio-player-icon" />
            </div>
          </button>
        )}
        {isCompleted && (
          <div className="audio-player-analyzing">
            Analyzing ...
          </div>
        )}
      </div>
    </div>
  );
}
