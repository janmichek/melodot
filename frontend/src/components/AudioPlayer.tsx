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
    <div className="w-full max-w-md space-y-8">
      <div className="flex h-48 flex-col items-center justify-center rounded-lg bg-muted">
        {isRecording && (
          <button
            onClick={onStartStop}
            className="relative h-24 w-24 cursor-pointer border-0 bg-transparent p-0"
            aria-label="Stop recording"
          >
            <div className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-75"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-500">
              <Square className="h-12 w-12 text-white" />
            </div>
          </button>
        )}
        {!isRecording && !isCompleted && (
          <button
            onClick={onStartStop}
            className="relative h-24 w-24 cursor-pointer border-0 bg-transparent p-0"
            aria-label="Start recording"
          >
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-colors">
              <Mic className="h-12 w-12 text-white" />
            </div>
          </button>
        )}
        {isCompleted && (
          <div className="text-2xl font-bold text-primary">
            Analyzing ...
          </div>
        )}
      </div>
    </div>
  );
}
