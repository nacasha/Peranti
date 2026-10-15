import { clsx } from "clsx"
import { type FC, type PointerEvent } from "react"

import { interfaceStore } from "src/services/interface-store"

import "./SidebarResizeHandle.scss"

interface SidebarResizeHandleProps {
  /**
   * Which edge of the sidebar the handle sits on. A handle on the right edge
   * grows the sidebar when dragged right, one on the left edge when dragged left.
   */
  edge: "left" | "right"

  /**
   * Current sidebar width, the starting point of a drag
   */
  width: number

  /**
   * Width to return to on double click
   */
  defaultWidth: number

  onResize: (width: number) => void
}

export const SidebarResizeHandle: FC<SidebarResizeHandleProps> = (props) => {
  const { edge, width, defaultWidth, onResize } = props

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()

    const handle = event.currentTarget
    const startX = event.clientX
    const startWidth = width
    const direction = edge === "right" ? 1 : -1

    handle.setPointerCapture(event.pointerId)
    interfaceStore.setIsResizingSidebar(true)

    const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
      onResize(startWidth + (moveEvent.clientX - startX) * direction)
    }

    const onPointerUp = () => {
      interfaceStore.setIsResizingSidebar(false)
      handle.removeEventListener("pointermove", onPointerMove)
      handle.removeEventListener("pointerup", onPointerUp)
      handle.removeEventListener("pointercancel", onPointerUp)
    }

    handle.addEventListener("pointermove", onPointerMove)
    handle.addEventListener("pointerup", onPointerUp)
    handle.addEventListener("pointercancel", onPointerUp)
  }

  const handleDoubleClick = () => {
    onResize(defaultWidth)
  }

  return (
    <div
      className={clsx("SidebarResizeHandle", edge)}
      role="separator"
      aria-orientation="vertical"
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    />
  )
}
