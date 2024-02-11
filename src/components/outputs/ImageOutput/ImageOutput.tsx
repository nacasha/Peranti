import { useCallback, type FC, useEffect, useMemo, useState, useRef } from "react"
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch"

import { ComponentLabel } from "src/components/common/ComponentLabel"
import { usePreviousValue } from "src/hooks/usePreviousValue"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./ImageOutput.scss"

interface TransformState {
  translateX: number | undefined
  translateY: number | undefined
  scale: number | undefined
}

interface ImageOutputProps extends OutputComponentProps<string> {
  width?: number
  showControl?: boolean
}

export const ImageOutput: FC<ImageOutputProps> = (props) => {
  const { value = "", label, onContextMenu, initialState, onStateChange } = props

  const previousValue = usePreviousValue(value)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [containerHeight, setContainerHeight] = useState<number>(0)

  const zoomFactor = 8

  const transformWrapperRef = useRef<ReactZoomPanPinchContentRef>(null)
  const transformListener = useRef<MutationObserver>()
  const transformState = useRef<TransformState>({
    translateX: initialState?.translateX,
    translateY: initialState?.translateY,
    scale: initialState?.scale
  })

  /**
   * Initial image scale
   */
  const imageScale = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) {
      return 0
    }

    return Math.min(containerWidth / 500, containerHeight / 500)
  }, [value, containerWidth, containerHeight])

  const initialPosition = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) {
      return { x: 0, y: 0 }
    }

    return {
      x: (containerWidth - (500 * imageScale)) / 2,
      y: (containerHeight - (500 * imageScale)) / 2
    }
  }, [containerWidth, containerHeight, value, imageScale])

  const handleResize = useCallback(() => {
    if (container !== null) {
      const rect = container.getBoundingClientRect()
      setContainerWidth(rect.width)
      setContainerHeight(rect.height)
    } else {
      setContainerWidth(0)
      setContainerHeight(0)
    }
  }, [container])

  const resetTransform = () => {
    transformWrapperRef.current?.setTransform(initialPosition.x, initialPosition.y, imageScale)
  }

  /**
   * Listen to transform change so we can resume the last position of zoom
   * when opening the applet
   */
  const listenTransformChanges = () => {
    const handleTransformChange: MutationCallback = (mutations) => {
      const mutation = mutations[0]
      if (mutation) {
        const mutationTarget = mutation.target as HTMLDivElement
        const transformString = mutationTarget.style.transform

        const translateMatch = transformString.match(/translate\((-?\d+\.?\d*)px, (-?\d+\.?\d*)px\)/)
        const scaleMatch = transformString.match(/scale\((-?\d+\.?\d*)\)/)

        if (translateMatch && scaleMatch) {
          const translateX = parseFloat(translateMatch[1])
          const translateY = parseFloat(translateMatch[2])
          const scale = parseFloat(scaleMatch[1])
          transformState.current = { translateX, translateY, scale }
        }
      }
    }

    if (transformListener.current) {
      transformListener.current.disconnect()
    }

    if (container) {
      const transformComponent = container.querySelector(".react-transform-component")
      if (transformComponent) {
        transformListener.current = new window.MutationObserver(handleTransformChange)
        transformListener.current.observe(transformComponent, {
          attributes: true,
          attributeFilter: ["style"]
        })
      }
    }
  }

  /**
   * Listen to window resize changes to calculate proper size of image
   */
  useEffect(() => {
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [handleResize])

  /**
   * Store last transform state to applet storage
   */
  useEffect(() => {
    return () => {
      if (onStateChange) {
        onStateChange(transformState.current)
      }
    }
  }, [])

  useEffect(() => {
    if (previousValue !== value) {
      resetTransform()
      transformState.current = {
        scale: undefined,
        translateX: undefined,
        translateY: undefined
      }
    }
  }, [value])

  return (
    <div className="ImageOutput">
      <ComponentLabel label={label} />
      <div className="ImageOutput-inner">
        <div
          ref={(el: HTMLDivElement | null) => { setContainer(el) }}
          className="ImageOutput-image-container"
          onContextMenu={onContextMenu}
        >
          {imageScale > 0 && (
            <TransformWrapper
              key={`${containerWidth}x${containerHeight}x${imageScale}`}
              ref={transformWrapperRef}
              initialScale={transformState.current.scale ?? imageScale}
              initialPositionX={transformState.current.translateX ?? initialPosition.x}
              initialPositionY={transformState.current.translateY ?? initialPosition.y}
              minScale={imageScale}
              maxScale={imageScale * zoomFactor}
              onInit={() => { listenTransformChanges() }}
            >
              {() => (
                <TransformComponent>
                  <div className="ImageOutput-image">
                    {value && <img src={value} />}
                  </div>
                </TransformComponent>
              )}
            </TransformWrapper>
          )}
        </div>
      </div>
    </div>
  )
}
