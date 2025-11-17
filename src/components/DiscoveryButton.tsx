import {clsx} from "clsx"
import {Button} from "@/components/ui/button"
import type {AudioControlsProps} from "@types"
import {Logo} from "@/components/ui/logo"

export default function DiscoveryButton({
  hasPermission,
  isRecording,
  isDiscovering,
  onStart,
  onStop,
}: AudioControlsProps) {
  const isProcessing = hasPermission && (isRecording || isDiscovering)

  const handleClick = () => {
    if (isProcessing) {
      onStop()
    } else {
      onStart()
    }
  }

  return (
    <div className="audio-player-container audio-player-recording-area">
      <div className="audio-player-button-wrapper">
        <Button
          onClick={handleClick}
          className="audio-player-button">
          {isProcessing && (
            <>
              <div className="audio-player-recording-pulse"></div>
              <div className="audio-player-recording-pulse-2"></div>
              <div className="audio-player-recording-pulse-3"></div>
            </>
          )}
          <div className={clsx(
            "audio-player-button-inner",
            isProcessing ? "audio-player-recording-bg" : "audio-player-start-bg"
          )}>
            {/* Show spinner while recording or recognizing; keep button actionable to stop */}
            <Logo className="audio-player-icon" animated={isProcessing} />
          </div>
        </Button>
      </div>
    </div>
  )
}
