import { type FC, useEffect, useState, useMemo, useCallback, useRef } from "react"
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"

interface TransformState {
  translateX: number | undefined
  translateY: number | undefined
  scale: number | undefined
}

interface MermaidOutputZoomableSVGProps {
  children?: any
  initialState?: TransformState
  onStageChange?: (state: any) => any
}

export const MermaidOutputZoomableSVG: FC<MermaidOutputZoomableSVGProps> = (props) => {
  const { children, initialState, onStageChange } = props

  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [containerHeight, setContainerHeight] = useState<number>(0)

  const zoomFactor = 10

  const transformListener = useRef<MutationObserver>()
  const transformState = useRef<TransformState>({
    translateX: initialState?.translateX,
    translateY: initialState?.translateY,
    scale: initialState?.scale
  })

  const imageScale = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) { return 0 }
    const scale = Math.min(containerWidth / 100, containerHeight / 100)
    return scale
  }, [containerWidth, containerHeight, children])

  const initialPosition = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) {
      return { x: 0, y: 0 }
    }

    return {
      x: (containerWidth - (100 * imageScale)) / 2,
      y: (containerHeight - (100 * imageScale)) / 2
    }
  }, [containerWidth, containerHeight, children, imageScale])

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
   * Listen to window resize event to adjust the imageScale
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
      if (onStageChange) {
        onStageChange(transformState.current)
      }
    }
  }, [])

  const controlsResetValue: [number, number, number] = [
    imageScale,
    initialPosition.x,
    initialPosition.y
  ]

  return (
    <div className="MermaidOutputZoomableSVG">
      <div className="MermaidOutputZoomableSVG-inner">
        <div
          ref={(el: HTMLDivElement | null) => { setContainer(el) }}
          className="MermaidOutputZoomableSVG-content"
        >
          {imageScale > 0 && (
            <TransformWrapper
              key={`${containerHeight}${containerWidth}${imageScale}`}
              initialScale={transformState.current.scale ?? imageScale}
              initialPositionX={transformState.current.translateX ?? initialPosition.x}
              initialPositionY={transformState.current.translateY ?? initialPosition.y}
              minScale={imageScale}
              maxScale={imageScale * zoomFactor}
              onInit={() => { listenTransformChanges() }}
            >
              {(controls) => (
                <>
                  <Controls controls={controls} resetValue={controlsResetValue} />
                  <TransformComponent>
                    {children}
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          )}
        </div>
      </div>
    </div>
  )
}

const Controls = (props: { controls: ReactZoomPanPinchContentRef, resetValue: [number, number, number] }) => {
  const { controls, resetValue } = props
  const { zoomIn, zoomOut, instance } = controls

  const handleZoomIn = () => {
    zoomIn()
  }

  const handleZoomOut = () => {
    zoomOut()
  }

  const handleResetZoom = () => {
    instance.setTransformState(...resetValue)
  }

  return (
    <div className="MermaidOutputZoomableSVG-actions">
      <Button icon={Icons.Plus} onClick={handleZoomIn} />
      <Button icon={Icons.Minus} onClick={handleZoomOut} />
      <Button icon={Icons.FullScreen} onClick={handleResetZoom} />
    </div>
  )
}
