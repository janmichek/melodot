import { Square } from "lucide-react";
import {Button} from "@/components/ui/button";

interface StopButtonProps {
  onClick: () => void;
}

export default function StopButton({ onClick }: StopButtonProps) {
  return (
    <Button onClick={onClick} className="audio-player-button">
      <div className="audio-player-recording-pulse"></div>
      <div className="audio-player-recording-pulse-2"></div>
      <div className="audio-player-recording-pulse-3"></div>
      <div className="audio-player-button-inner audio-player-recording-bg">
        <Square className="audio-player-icon" />
      </div>
    </Button>
  );
}
