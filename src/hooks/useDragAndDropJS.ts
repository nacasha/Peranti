import { useEffect, useRef, useState } from "react"

interface Options {
  onMouseMove?: (event: MouseEvent) => any
  onMouseUp?: (event: MouseEvent) => any
  dropAreaClass?: string
}

export function useDragAndDropJS(options: Options = {}) {
  const { onMouseMove, onMouseUp } = options

  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const [mouseMovePosition, setMouseMovePosition] = useState({ x: 0, y: 0 })
  const [mouseDownPosition, setMouseDownPosition] = useState<{ x: number, y: number } | undefined>()

  const draggableElementRef = useRef<HTMLDivElement>(null)
  const draggableElementPlaceholderRef = useRef<HTMLDivElement>(null)

  const startDragging = (event: MouseEvent) => {
    if (event.buttons === 0) {
      setIsDragging(false)
      setMouseDownPosition(undefined)
      setIsMouseDown(false)
      stopDragging()
      return
    }

    const root = document.querySelector<HTMLDivElement>(".AppRoot")
    if (draggableElementRef.current && draggableElementPlaceholderRef.current && root) {
      draggableElementPlaceholderRef.current.style.width = `${draggableElementRef.current.clientWidth + 1}px`
      draggableElementPlaceholderRef.current.style.zIndex = draggableElementRef.current.style.zIndex

      draggableElementRef.current.style.position = "fixed"
      draggableElementRef.current.style.pointerEvents = "none"
      draggableElementRef.current.style.zIndex = "1000"
      draggableElementRef.current.style.left = `${event.x}px`
      draggableElementRef.current.style.top = `${event.y}px`
      draggableElementRef.current.style.cursor = "move"
      draggableElementRef.current.style.opacity = "0.5"
      draggableElementRef.current.style.filter = "0.5"
      if (mouseDownPosition) {
        draggableElementRef.current.style.transform = `translate(${-mouseDownPosition?.x}px, ${-mouseDownPosition?.y}px)`
      }

      root.append(draggableElementRef.current)
      root.style.cursor = "move"

      if (!isDragging) {
        setIsDragging(true)
      }
    }
  }

  const stopDragging = () => {
    const root = document.querySelector<HTMLDivElement>(".AppRoot")
    if (draggableElementRef.current && draggableElementPlaceholderRef.current && root) {
      if (draggableElementPlaceholderRef.current.parentElement) {
        draggableElementPlaceholderRef.current.parentElement.append(draggableElementRef.current)

        draggableElementRef.current.removeAttribute("style")
        draggableElementPlaceholderRef.current.removeAttribute("style")

        root.style.cursor = "initial"

        if (isDragging) {
          setIsDragging(false)
        }
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (mouseMovePosition) {
        const deltaX = Math.abs(event.clientX - mouseMovePosition.x)
        const deltaY = Math.abs(event.clientY - mouseMovePosition.y)

        if (deltaX > 6 || deltaY > 6) {
          startDragging(event)

          if (onMouseMove) {
            onMouseMove(event)
          }
        }
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      setMouseDownPosition(undefined)
      setIsMouseDown(false)

      if (onMouseUp) {
        onMouseUp(event)
      }
    }

    if (isMouseDown) {
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("mousemove", handleMouseMove)
    } else {
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mousemove", handleMouseMove)
    }

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isMouseDown])

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      stopDragging()
      setMouseDownPosition(undefined)
      setIsMouseDown(false)

      if (onMouseUp) {
        onMouseUp(event)
      }
    }

    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp)
    } else {
      document.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        setIsMouseDown(true)
        setMouseMovePosition({ x: event.clientX, y: event.clientY })

        if (draggableElementRef.current) {
          const xRelativeToElement = event.clientX - draggableElementRef.current.getBoundingClientRect().left
          const yRelativeToElement = event.clientY - draggableElementRef.current.getBoundingClientRect().top

          if (!mouseDownPosition) {
            setMouseDownPosition({ x: xRelativeToElement, y: yRelativeToElement })
          }
        }
      }
    }

    if (draggableElementRef.current) {
      draggableElementRef.current.addEventListener("mousedown", handleMouseDown)

      return () => {
        draggableElementRef.current?.removeEventListener("mousedown", handleMouseDown)
      }
    }
  }, [draggableElementRef])

  return { draggableElementRef, draggableElementPlaceholderRef }
}
