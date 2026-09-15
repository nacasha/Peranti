import { memo, type FC } from "react"

import { windowManager } from "src/services/window-manager"

import "./MacOSTrafficLights.scss"

interface MacOSTrafficLightsProps {
  className?: string
}

export const MacOSTrafficLights: FC<MacOSTrafficLightsProps> = memo(({ className }) => {
  const handleClose = () => void windowManager.close()
  const handleMinimize = () => void windowManager.minimize()
  const handleMaximize = () => void windowManager.toggleMaximize()

  return (
    <div className={["MacOSTrafficLights", className].filter(Boolean).join(" ")} data-tauri-drag-region>
      <button className="MacOSTrafficLights-btn close" onClick={handleClose} aria-label="Close">
        <span className="MacOSTrafficLights-icon">✕</span>
      </button>
      <button className="MacOSTrafficLights-btn minimize" onClick={handleMinimize} aria-label="Minimize">
        <span className="MacOSTrafficLights-icon">─</span>
      </button>
      <button className="MacOSTrafficLights-btn maximize" onClick={handleMaximize} aria-label="Maximize">
        <span className="MacOSTrafficLights-icon">⊹</span>
      </button>
    </div>
  )
}, () => true)
