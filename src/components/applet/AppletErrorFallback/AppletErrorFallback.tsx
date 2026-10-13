import { useState, type FC } from "react"
import { type FallbackProps } from "react-error-boundary"
import toast from "react-hot-toast"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { ClipboardService } from "src/services/clipboard-service"

import "./AppletErrorFallback.scss"

/**
 * Shown in place of a tool or page that crashed while rendering: what
 * happened, the error to copy, and ways to recover without losing the app
 */
export const AppletErrorFallback: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const message = error instanceof Error ? error.message : String(error)
  const details = error instanceof Error && error.stack ? error.stack : message

  const handleCopy = async() => {
    try {
      await ClipboardService.copyAsText(details)
      setIsCopied(true)
      window.setTimeout(() => { setIsCopied(false) }, 1500)
    } catch {
      toast.error("Couldn't copy the error")
    }
  }

  const handleReload = () => {
    window.location.href = "/"
  }

  return (
    <div className="AppletErrorFallback" role="alert">
      <div className="AppletErrorFallback-card">
        <div className="AppletErrorFallback-icon">
          <Icons.Warning size={22} aria-hidden />
        </div>

        <div className="AppletErrorFallback-heading">
          <h2 className="AppletErrorFallback-title">Something went wrong</h2>
          <p className="AppletErrorFallback-description">
            This view hit an error and couldn&apos;t be shown. Your other tabs are fine.
          </p>
        </div>

        <code className="AppletErrorFallback-message" title={message}>{message || "Unknown error"}</code>

        <div className="AppletErrorFallback-actions">
          <Button icon={Icons.Reset} variant="primary" onClick={resetErrorBoundary}>Try Again</Button>
          <Button icon={Icons.Refresh} onClick={handleReload}>Reload App</Button>
        </div>

        <div className="AppletErrorFallback-details">
          <div className="AppletErrorFallback-detailsBar">
            <button
              type="button"
              className="AppletErrorFallback-toggle"
              aria-expanded={isDetailsOpen}
              onClick={() => { setIsDetailsOpen(!isDetailsOpen) }}
            >
              {isDetailsOpen ? <Icons.ChevronUp size={13} aria-hidden /> : <Icons.ChevronDown size={13} aria-hidden />}
              {isDetailsOpen ? "Hide details" : "Show details"}
            </button>
            <button type="button" className="AppletErrorFallback-toggle" onClick={() => { void handleCopy() }}>
              {isCopied ? <Icons.CopyDone size={13} aria-hidden /> : <Icons.Copy size={13} aria-hidden />}
              {isCopied ? "Copied" : "Copy error"}
            </button>
          </div>
          {isDetailsOpen && <pre className="AppletErrorFallback-stack">{details}</pre>}
        </div>
      </div>
    </div>
  )
}
