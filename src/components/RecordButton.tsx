import {Mic} from "lucide-react";
import {clsx} from "clsx";
import {Button} from "@/components/ui/button";

interface RecordButtonProps {
  hasPermission: boolean;
  onStart: () => void;
  onRequestPermission: () => void;
  className?: string;
  tabIndex?: number;
  ariaHidden?: boolean;
}

export default function RecordButton({
  hasPermission,
  onStart,
  onRequestPermission,
  className,
  tabIndex,
  ariaHidden,
}: RecordButtonProps) {
  const handleClick = () => {
    if (!hasPermission) {
      onRequestPermission();
    } else {
      onStart();
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={clsx("audio-player-button", className)}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
    >
      <div className="audio-player-button-inner audio-player-start-bg">
        <Mic className="audio-player-icon" />
      </div>
    </Button>
  );
}
