import pintora from "@pintora/standalone"
import { type FC, useEffect, useState, useRef } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { ZoomableContent } from "src/components/common/ZoomableContent"
import { interfaceStore } from "src/services/interface-store"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import { pintoraOutputClasses } from "./PintoraOutput.css"

interface PintoraOutputProps extends OutputComponentProps {}

export const PintoraOutput: FC<PintoraOutputProps> = (props) => {
  const { label, value = "", onContextMenu, onStateChange, initialState, fieldKey } = props

  const renderRef = useRef<HTMLDivElement>(null)
  const [pintoraSyntax, setPintoraSyntax] = useState(() => value)

  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 })
  const [svgContent, setSvgContent] = useState("")
  const [isSvgReady, setIsSvgReady] = useState(false)

  const renderPintora = async(newPintoraSyntax: string) => {
    if (newPintoraSyntax.trim().length === 0) {
      return
    }

    try {
      if (newPintoraSyntax && renderRef.current) {
        pintora.renderTo(newPintoraSyntax, {
          container: renderRef.current,
          onRender: (renderer: any) => {
            const width = renderer.ir?.width
            const height = renderer.ir?.height

            setSvgContent(renderer.container.innerHTML)
            setSvgSize({ width: Number(width), height: Number(height) })

            setIsSvgReady(true)
          },
          config: {
            themeConfig: {
              theme: interfaceStore.isDarkTheme ? "dark" : "default",
              themeVariables: {
                canvasBackground: "transparent"
              }
            }
          }
        })
      }
    } catch (exception) {
      console.log(exception)
    }
  }

  /**
   * Render pintora diagram when the root container is ready
   * or the value has been changed
   */
  useEffect(() => {
    void renderPintora(pintoraSyntax)
  }, [pintoraSyntax, renderRef])

  /**
   * We use another variable to store pintora syntax
   * rather than directly from value
   */
  useEffect(() => {
    setPintoraSyntax(value)
  }, [value])

  /**
   * Fix render unknown diagram parts
   */
  useEffect(() => {
    setPintoraSyntax(value.concat(" "))
  }, [])

  return (
    <div className={pintoraOutputClasses.root} style={{ gridArea: fieldKey }} onContextMenu={onContextMenu}>
      <div key={pintoraSyntax} ref={renderRef} className={pintoraOutputClasses.output} />
      <AppletComponentHead showMaximize label={label} />
      <div className={pintoraOutputClasses.inner}>
        <ZoomableContent
          initialState={initialState}
          onStageChange={onStateChange}
          isContentReady={isSvgReady}
          contentWidth={svgSize.width}
          contentHeight={svgSize.height}
        >
          <div dangerouslySetInnerHTML={{ __html: svgContent }} />
        </ZoomableContent>
      </div>
    </div>
  )
}
