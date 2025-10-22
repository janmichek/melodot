import { Mic } from "lucide-react";
import { ButtonProps } from "../types";

export default function RecordButton({ onClick }: ButtonProps) {
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
