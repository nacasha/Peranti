import { useLayoutEffect, useRef, useState, type CSSProperties, type FC } from "react"
import { createPortal } from "react-dom"

import { useSelector } from "src/hooks/useSelector"
import { fileDropService } from "src/services/file-drop-service"

import "./FileDropTarget.scss"

interface FileDropTargetProps {
  fieldKey: string
  label: string
}

/**
 * Glowing frame laid over the input field rendered just before it, marking
 * that a dragged file can be dropped there. It is fixed-positioned from the
 * field's measured rect and portalled to the app root: the field areas clip
 * their overflow and the area is a view-transition root (a containing block
 * for fixed children), either of which would cut the glow off at their edges.
 */
export const FileDropTarget: FC<FileDropTargetProps> = (props) => {
  const { fieldKey, label } = props

  const markerRef = useRef<HTMLSpanElement>(null)
  const [rect, setRect] = useState<DOMRect>()

  const isHovered = useSelector(() => {
    const zone = fileDropService.hoveredZone
    return zone?.type === "field" && zone.id === fieldKey
  })

  useLayoutEffect(() => {
    const field = markerRef.current?.previousElementSibling
    setRect(field?.getBoundingClientRect())
  }, [])

  const portalRoot = document.querySelector(".AppRoot")

  // The marker stays in place so there is always a sibling to measure
  const marker = <span ref={markerRef} hidden />

  if (rect === undefined || !portalRoot) {
    return marker
  }

  const style: CSSProperties = {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  }

  return (
    <>
      {marker}
      {createPortal(
        <div
          className="FileDropTarget"
          data-hovered={isHovered || undefined}
          data-file-drop-zone="field"
          data-file-drop-id={fieldKey}
          style={style}
        >
          <div className="FileDropTarget-text">
            {isHovered ? "Release to fill" : "Drop here"} <strong>{label}</strong>
          </div>
        </div>,
        portalRoot
      )}
    </>
  )
}
