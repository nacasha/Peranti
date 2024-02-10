import { useCallback, type FC, useEffect, useMemo, useState } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"

import { Button } from "src/components/common/Button"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./ImageOutput.scss"

interface ImageOutputProps extends OutputComponentProps<string> {
  width?: number
  showControl?: boolean
}

export const ImageOutput: FC<ImageOutputProps> = (props) => {
  const { value = "", label, showControl = false, onContextMenu } = props

  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [containerHeight, setContainerHeight] = useState<number>(0)

  const [imageLoaded, setImageLoaded] = useState(true)
  const [imageNaturalWidth, setImageNaturalWidth] = useState<number>(0)
  const [imageNaturalHeight, setImageNaturalHeight] = useState<number>(0)

  const zoomFactor = 8

  const imageScale = useMemo(() => {
    if (
      containerWidth === 0 ||
      containerHeight === 0 ||
      imageNaturalWidth === 0 ||
      imageNaturalHeight === 0
    ) { return 0 }

    if (imageNaturalHeight < containerHeight &&
      imageNaturalWidth < containerWidth) {
      return 1
    }

    const scale = Math.min(
      containerWidth / imageNaturalWidth,
      containerHeight / imageNaturalHeight
    )
    return scale
  }, [
    value,
    containerWidth,
    containerHeight,
    imageNaturalWidth,
    imageNaturalHeight
  ])

  const handleImageOnLoad = (image: HTMLImageElement) => {
    setImageNaturalWidth(image.naturalWidth)
    setImageNaturalHeight(image.naturalHeight)
  }

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

  useEffect(() => {
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [handleResize])

  useEffect(() => {
    setImageLoaded(false)

    const image = new Image()
    image.onload = () => {
      handleImageOnLoad(image)
      setImageLoaded(true)
    }
    image.src = value
  }, [value])

  return (
    <div className="ImageOutput">
      <div className="InputOutputLabel">
        {label}
      </div>
      <div className="ImageOutput-inner">
        <div
          ref={(el: HTMLDivElement | null) => { setContainer(el) }}
          className="ImageOutput-image"
          onContextMenu={onContextMenu}
        >
          {imageScale > 0 && (
            <TransformWrapper
              key={`${containerWidth}x${containerHeight}x${imageScale}`}
              initialScale={imageScale}
              minScale={imageScale}
              maxScale={imageScale * zoomFactor}
              centerOnInit
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                imageLoaded && (
                  <ImageShow
                    zoomIn={zoomIn}
                    zoomOut={zoomOut}
                    resetTransform={resetTransform}
                    output={value}
                    showControl={showControl}
                  />
                )
              )}
            </TransformWrapper>
          )}
        </div>
      </div>
    </div>
  )
}

const ImageShow = (props: any) => {
  const { showControl, zoomIn, zoomOut, resetTransform, output } = props

  return (
    <>
      {showControl && (
        <div className="ImageOutput-actions">
          <Button onClick={() => { zoomIn() }}>
            Zoom In
          </Button>
          <Button onClick={() => { zoomOut() }}>
            Zoom Out
          </Button>
          <Button onClick={() => { resetTransform() }}>
            Reset Zoom
          </Button>
        </div>
      )}
      <TransformComponent>
        <img src={output} alt="test" />
      </TransformComponent>
    </>
  )
}
