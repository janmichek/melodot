import {Mic} from "lucide-react";
import {Button} from "@/components/ui/button";

interface RecordButtonProps {
  hasPermission: boolean;
  isRecording: boolean;
  onStart: () => void;
  onRequestPermission: () => void;
}

export default function RecordButton({
  hasPermission,
  onStart,
  onRequestPermission,
}: RecordButtonProps) {
  const handleClick = () => {
    if (!hasPermission) {
      onRequestPermission();
    } else {
      onStart();
    }
  };

  return (
    <Button onClick={handleClick} className="audio-player-button">
      <div className="audio-player-button-inner audio-player-start-bg">
        <Mic className="audio-player-icon" />
      </div>
    </Button>
  );
}
