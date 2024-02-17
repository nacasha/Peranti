import clsx from "clsx"
import { type FC, useEffect, useState, useMemo, useCallback, useRef } from "react"
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"

import { zoomableContentClasses } from "./ZoomableContent.css"

interface TransformState {
  translateX: number | undefined
  translateY: number | undefined
  scale: number | undefined
}

interface ZoomableContentProps {
  children?: any
  initialState?: TransformState
  onStageChange?: (state: any) => any
  checkered?: boolean
  isContentReady?: boolean
  contentWidth?: number
  contentHeight?: number
}

export const ZoomableContent: FC<ZoomableContentProps> = (props) => {
  const {
    children,
    initialState,
    checkered,
    onStageChange,
    contentWidth: contentWidthProps,
    contentHeight: contentHeightProps,
    isContentReady: isContentReadyProps
  } = props

  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  const [isContentReady, setIsContentReady] = useState(isContentReadyProps ?? true)
  const [contentWidth, setContentWidth] = useState(contentWidthProps ?? 100)
  const [contentHeight, setContentHeight] = useState(contentHeightProps ?? 100)

  /**
   * Maximum zoom factor
   */
  const zoomFactor = 10

  const transformListener = useRef<MutationObserver>()
  const transformState = useRef<TransformState>({
    translateX: initialState?.translateX,
    translateY: initialState?.translateY,
    scale: initialState?.scale
  })

  const imageScale = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) { return 0 }
    return Math.min(containerWidth / contentWidth, containerHeight / contentHeight)
  }, [containerWidth, containerHeight, contentWidth, containerHeight, children])

  /**
   * Initial position of transform
   */
  const initialPosition = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) {
      return { x: 0, y: 0 }
    }

    return {
      x: (containerWidth - (contentWidth * imageScale)) / 2,
      y: (containerHeight - (contentHeight * imageScale)) / 2
    }
  }, [containerWidth, containerHeight, contentWidth, containerHeight, children, imageScale])

  /**
   * Set new container size
   */
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
   * Listen to container change caused by toggled sidebar
   */
  useEffect(() => {
    if (container) {
      new ResizeObserver(handleResize).observe(container)
    }
  }, [container])

  useEffect(() => {
    if (isContentReadyProps) {
      setIsContentReady(isContentReadyProps)
    }
  }, [isContentReadyProps])

  /**
   * Store last transform state to applet storage
   */
  useEffect(() => {
    /**
     * Send transform current position and zoom when unload the component
     */
    return () => {
      if (onStageChange) {
        onStageChange(transformState.current)
      }
    }
  }, [])

  useEffect(() => {
    if (contentWidthProps && contentHeightProps) {
      setContentWidth(contentWidthProps)
      setContentHeight(contentHeightProps)
    }
  }, [contentWidthProps, contentHeightProps])

  /**
   * Reset value of transform
   */
  const controlsResetValue: [number, number, number] = [
    imageScale,
    initialPosition.x,
    initialPosition.y
  ]

  return (
    <div className={zoomableContentClasses.root}>
      <div className={zoomableContentClasses.body}>
        <div
          ref={(el: HTMLDivElement | null) => { setContainer(el) }}
          className={clsx(zoomableContentClasses.content, { [zoomableContentClasses.checkered]: checkered })}
        >
          {isContentReady && (
            <TransformWrapper
              key={`${containerHeight}${containerWidth}${contentWidth}${contentHeight}${imageScale}`}
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
    <div className={zoomableContentClasses.actions}>
      <Button icon={Icons.Plus} onClick={handleZoomIn} />
      <Button icon={Icons.Minus} onClick={handleZoomOut} />
      <Button icon={Icons.FullScreen} onClick={handleResetZoom} />
    </div>
  )
}
