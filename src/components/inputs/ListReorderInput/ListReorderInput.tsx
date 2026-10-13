import { type CSSProperties, type FC, type PointerEvent, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { Icons } from "src/constants/icons"
import { type InputComponentProps } from "src/types/InputComponentProps"

import { moveItem } from "./move-item.ts"
import { parseOrder } from "./parse-order.ts"
import { reconcileOrder } from "./reconcile-order.ts"

import "./ListReorderInput.scss"

interface ListReorderInputProps extends InputComponentProps {
  /**
   * Item labels, set in `props` or `computedProps`
   */
  items?: string[]
}

/**
 * Geometry captured when a drag starts. Items move with transforms while dragging,
 * so their live rects can't be used to work out the drop position.
 */
interface DragMetrics {
  firstItemTop: number
  itemHeight: number
  left: number
  width: number
  grabOffsetX: number
  grabOffsetY: number
}

interface Pointer {
  x: number
  y: number
}

/**
 * Drag to reorder items that come from another input.
 * The value is the order as a JSON array of item indexes.
 */
export const ListReorderInput: FC<ListReorderInputProps> = (props) => {
  const { label, fieldKey, value, readOnly, items = [], onValueChange } = props

  const [draggedPosition, setDraggedPosition] = useState<number>()
  const [targetPosition, setTargetPosition] = useState<number>()
  const [pointer, setPointer] = useState<Pointer>({ x: 0, y: 0 })

  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const metricsRef = useRef<DragMetrics>()

  const order = useMemo(() => reconcileOrder(parseOrder(value), items.length), [value, items.length])

  /**
   * HTML5 drag events never fire inside the Tauri webview (file drop handling is on),
   * so dragging follows the pointer instead.
   */
  const handlePointerDown = (event: PointerEvent<HTMLLIElement>, position: number) => {
    const firstItem = itemRefs.current[0]
    if (readOnly === true || event.button !== 0 || !firstItem) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    metricsRef.current = {
      firstItemTop: firstItem.getBoundingClientRect().top,
      itemHeight: rect.height,
      left: rect.left,
      width: rect.width,
      grabOffsetX: event.clientX - rect.left,
      grabOffsetY: event.clientY - rect.top
    }
    setPointer({ x: event.clientX, y: event.clientY })
    setDraggedPosition(position)
    setTargetPosition(position)
  }

  useEffect(() => {
    const metrics = metricsRef.current
    if (draggedPosition === undefined || !metrics) {
      return
    }

    const findPosition = (clientY: number) => {
      const position = Math.floor((clientY - metrics.firstItemTop) / metrics.itemHeight)
      return Math.min(Math.max(position, 0), order.length - 1)
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      setPointer({ x: event.clientX, y: event.clientY })
      setTargetPosition(findPosition(event.clientY))
    }

    const handlePointerUp = (event: globalThis.PointerEvent) => {
      const target = findPosition(event.clientY)
      if (target !== draggedPosition) {
        onValueChange(JSON.stringify(moveItem(order, draggedPosition, target)))
      }
      setDraggedPosition(undefined)
      setTargetPosition(undefined)
    }

    document.body.style.cursor = "grabbing"
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)
    return () => {
      document.body.style.cursor = ""
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [draggedPosition, order, onValueChange])

  /**
   * How far an item is pushed (in item heights) to open a gap at the drop position
   */
  const getShift = (position: number) => {
    if (draggedPosition === undefined || targetPosition === undefined) {
      return 0
    }
    if (position === draggedPosition) {
      return targetPosition - draggedPosition
    }
    if (draggedPosition < targetPosition && position > draggedPosition && position <= targetPosition) {
      return -1
    }
    if (draggedPosition > targetPosition && position >= targetPosition && position < draggedPosition) {
      return 1
    }
    return 0
  }

  const metrics = metricsRef.current
  const isDragging = draggedPosition !== undefined && metrics !== undefined

  const renderItemContent = (itemIndex: number) => (
    <>
      <Icons.DragHandle className="ListReorderInput-handle" size={14} aria-hidden />
      <span className="ListReorderInput-label">{items[itemIndex]}</span>
    </>
  )

  return (
    <div className="ListReorderInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <ol className="ListReorderInput-list" data-dragging={isDragging}>
        {order.map((itemIndex, position) => (
          <li
            key={itemIndex}
            ref={(element) => { itemRefs.current[position] = element }}
            className="ListReorderInput-item"
            data-readonly={readOnly}
            data-placeholder={position === draggedPosition}
            style={{ transform: `translateY(${getShift(position) * (metrics?.itemHeight ?? 0)}px)` }}
            onPointerDown={(event) => { handlePointerDown(event, position) }}
          >
            {renderItemContent(itemIndex)}
          </li>
        ))}
      </ol>
      {isDragging && createPortal(
        <div
          className="ListReorderInput-ghost"
          style={{
            width: metrics.width,
            height: metrics.itemHeight,
            transform: `translate(${pointer.x - metrics.grabOffsetX}px, ${pointer.y - metrics.grabOffsetY}px)`
          } satisfies CSSProperties}
        >
          {renderItemContent(order[draggedPosition])}
        </div>,
        document.body
      )}
    </div>
  )
}
