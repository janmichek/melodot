import { Mic, Square } from "lucide-react";

interface AudioPlayerProps {
  isRecording: boolean;
  isCompleted: boolean;
  duration?: number;
  audioBlob?: Blob | null;
  onStartStop: () => void;
  onReset: () => void;
}

export default function AudioPlayer({
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
        {isRecording && (
          <button
            onClick={onStartStop}
            className="audio-player-button"
            aria-label="Stop recording"
          >
            <div className="audio-player-recording-pulse"></div>
            <div className="audio-player-button-inner audio-player-recording-bg">
              <Square className="audio-player-icon" />
            </div>
          </button>
        )}
        {!isRecording && !isCompleted && (
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
