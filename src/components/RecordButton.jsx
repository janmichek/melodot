// @ts-check

import {Mic} from "lucide-react";
import {Button} from "@/components/ui/button";

/**
 * @param {{hasPermission: boolean, onStart: () => void, onRequestPermission: () => void}} props
 */
export default function RecordButton({
  hasPermission,
  onStart,
  onRequestPermission,
}) {
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
