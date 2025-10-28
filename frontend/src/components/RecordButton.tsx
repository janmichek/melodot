import { Mic } from "lucide-react";

interface RecordButtonProps {
  onClick: () => void;
}

export default function RecordButton({ onClick }: RecordButtonProps) {
  return (
    <button
      onClick={onClick}
      className="audio-player-button">
      <div className="audio-player-button-inner audio-player-start-bg">
        <Mic className="audio-player-icon" />
      </div>
    </button>
  );
}
