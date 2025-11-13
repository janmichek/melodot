import {Square} from "lucide-react";
import {clsx} from "clsx";
import {Button} from "@/components/ui/button";

interface StopButtonProps {
  onClick: () => void;
  className?: string;
  tabIndex?: number;
  ariaHidden?: boolean;
}

export default function StopButton({
  onClick,
  className,
  tabIndex,
  ariaHidden,
}: StopButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={clsx("audio-player-button", className)}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
    >
      <div className="audio-player-recording-pulse"></div>
      <div className="audio-player-recording-pulse-2"></div>
      <div className="audio-player-recording-pulse-3"></div>
      <div className="audio-player-button-inner audio-player-recording-bg">
        <Square className="audio-player-icon" />
      </div>
    </Button>
  );
}
