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
  const { output = "", showControl = false } = props

  const scaleUp = true
  const zoomFactor = 8

  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [containerHeight, setContainerHeight] = useState<number>(0)

  const [imageNaturalWidth, setImageNaturalWidth] = useState<number>(0)
  const [imageNaturalHeight, setImageNaturalHeight] = useState<number>(0)

  const [hideImage, setHideImage] = useState(false)
  const [firstTimeLoad, setFirstTimeLoad] = useState(true)

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
    return scaleUp ? scale : Math.max(scale, 1)
  }, [
    output,
    scaleUp,
    containerWidth,
    containerHeight,
    imageNaturalWidth,
    imageNaturalHeight
  ])

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

  const handleImageOnLoad = (image: HTMLImageElement) => {
    setImageNaturalWidth(image.naturalWidth)
    setImageNaturalHeight(image.naturalHeight)
  }

  useEffect(() => {
    const image = new Image()
    image.onload = () => { handleImageOnLoad(image) }
    image.src = output

    if (firstTimeLoad) {
      setFirstTimeLoad(false)
    } else {
      setHideImage(true)
      setTimeout(() => {
        setHideImage(false)
      }, 1000)
    }
  }, [output])

  return (
    <div className="ImageOutput">
      <div className="ImageOutput-inner" ref={(el: HTMLDivElement | null) => { setContainer(el) }}>
        {(imageScale > 0 && !hideImage) && (
          <TransformWrapper
            key={`${containerWidth}x${containerHeight}`}
            initialScale={imageScale}
            minScale={imageScale}
            initialPositionX={0}
            initialPositionY={0}
            maxScale={imageScale * zoomFactor}
            centerOnInit
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <ImageShow
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                resetTransform={resetTransform}
                output={output}
                showControl={showControl}
              />
            )}
          </TransformWrapper>
        )}
      </div>
    </div>
  )
}

const ImageShow = (props: any) => {
  const { showControl, zoomIn, zoomOut, resetTransform, output } = props

  useEffect(() => {
    resetTransform()
  }, [output])

  return (
    <>
      {showControl && (
        <div className="tools">
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
