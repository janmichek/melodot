import {Button} from "@/shared/ui/button"
import type {AudioControlsProps} from "@types"
import {Logo} from "@/shared/ui/logo"

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
          aria-label={isProcessing ? "Stop recording" : "Start recording with Donalyze"}
          data-recording={isRecording}
          data-discovering={isDiscovering}
          className="audio-player-button">
          {isProcessing && (
            <>
              <div className="audio-player-recording-pulse"></div>
              <div className="audio-player-recording-pulse-2"></div>
              <div className="audio-player-recording-pulse-3"></div>
            </>
          )}
          <div className="audio-player-button-inner">
            <span className="audio-player-grooves" aria-hidden="true" />
            <Logo className="audio-player-icon" animated={isProcessing} />
          </div>
        </Button>
      </div>
    </div>
  )
}
