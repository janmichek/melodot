import {Mic} from "lucide-react";
import {clsx} from "clsx";
import {Button} from "@/components/ui/button";

interface RecordButtonProps {
  onStart: () => void;
  className?: string;
  tabIndex?: number;
  ariaHidden?: boolean;
}

export default function RecordButton({
  onStart,
  className,
  tabIndex,
  ariaHidden,
}: RecordButtonProps) {
  const handleClick = () => {
    // onStart will handle permission request and recording start
    onStart();
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
