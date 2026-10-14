import RCTooltip from "rc-tooltip"
import { type ComponentProps, type FC, type MouseEvent, type ReactNode, useEffect, useRef, useState } from "react"

import { Button } from "../Button"

import "./PopoverConfirm.scss"

export interface PopoverConfirmation {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /**
   * "danger" paints the confirm button red, for actions that remove data
   */
  variant?: "primary" | "danger"
}

interface PopoverConfirmProps {
  /**
   * Element that triggers the action, its click is held back until confirmed
   */
  children: ReactNode

  /**
   * Read on every click. Returning `undefined` skips the popover and lets the
   * click through, so a confirmation can depend on the current state
   */
  confirmation: () => PopoverConfirmation | undefined

  onConfirm: () => void
  placement?: ComponentProps<typeof RCTooltip>["placement"]
}

/**
 * Small confirmation popover anchored to the element that triggered the action,
 * a lighter alternative to `ConfirmDialog`
 */
export const PopoverConfirm: FC<PopoverConfirmProps> = (props) => {
  const { children, confirmation, onConfirm, placement = "bottomRight" } = props

  const [pending, setPending] = useState<PopoverConfirmation>()
  const anchorRef = useRef<HTMLSpanElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const isOpen = pending !== undefined

  /**
   * Dismiss on outside click or Escape. Clicks on the anchor are handled by
   * `handleClickCapture`, which closes the popover on its own
   */
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleMouseDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (!anchorRef.current?.contains(target) && !popupRef.current?.contains(target)) {
        setPending(undefined)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPending(undefined)
      }
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const handleClickCapture = (event: MouseEvent) => {
    if (isOpen) {
      event.preventDefault()
      event.stopPropagation()
      setPending(undefined)
      return
    }

    const next = confirmation()
    if (next) {
      event.preventDefault()
      event.stopPropagation()
      setPending(next)
    }
  }

  const handleConfirm = () => {
    setPending(undefined)
    onConfirm()
  }

  const handleCancel = () => {
    setPending(undefined)
  }

  return (
    <RCTooltip
      prefixCls="PopoverConfirm"
      visible={isOpen}
      trigger={[]}
      placement={placement}
      showArrow
      destroyTooltipOnHide
      zIndex={1000}
      overlay={pending && (
        <div className="PopoverConfirm-panel" ref={popupRef} role="alertdialog">
          <div className="PopoverConfirm-title">{pending.title}</div>
          {pending.description && (
            <div className="PopoverConfirm-description">{pending.description}</div>
          )}
          <div className="PopoverConfirm-actions">
            <Button onClick={handleCancel}>{pending.cancelLabel ?? "Cancel"}</Button>
            <Button variant={pending.variant ?? "primary"} onClick={handleConfirm} autoFocus>
              {pending.confirmLabel ?? "Confirm"}
            </Button>
          </div>
        </div>
      )}
    >
      <span className="PopoverConfirm-anchor" ref={anchorRef} onClickCapture={handleClickCapture}>
        {children}
      </span>
    </RCTooltip>
  )
}
