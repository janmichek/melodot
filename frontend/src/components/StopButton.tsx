import { Square } from "lucide-react";
import { ButtonProps } from "../types";

export default function StopButton({ onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className="audio-player-button">
      <div className="audio-player-recording-pulse"></div>
      <div className="audio-player-recording-pulse-2"></div>
      <div className="audio-player-recording-pulse-3"></div>
      <div className="audio-player-button-inner audio-player-recording-bg">
        <Square className="audio-player-icon" />
      </div>
    </button>
  );
}
