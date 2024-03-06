import mermaid from "mermaid"
import { type FC, useEffect, useState, useRef } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { ZoomableContent } from "src/components/common/ZoomableContent"
import { Theme } from "src/enums/theme-2"
import { interfaceStore } from "src/services/interface-store"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./MermaidOutput.scss"

interface MermaidOutputProps extends OutputComponentProps {}

export const MermaidOutput: FC<MermaidOutputProps> = (props) => {
  const { label, value = "", onContextMenu, onStateChange, initialState, fieldKey } = props

  const renderRef = useRef<HTMLDivElement>(null)

  const [svgString, setSvgString] = useState("")
  const [mermaidSyntax, setMermaidSyntax] = useState(() => value)

  const renderMermaid = async(value: string) => {
    try {
      if (value) {
        const { svg } = await mermaid.mermaidAPI.render("mermaidSvgRenderer", value)
        setSvgString(svg)
      }
    } catch (exception) {
      console.log(exception)
    }
  }

  /**
   * Render mermaid diagram when the root container is ready
   * or the value has been changed
   */
  useEffect(() => {
    void renderMermaid(value)
  }, [mermaidSyntax, renderRef])

  /**
   * We use another variable to store mermaid syntax
   * rather than directly from value
   */
  useEffect(() => {
    setMermaidSyntax(value)
  }, [value])

  /**
   * Fix MermaidJS render unknown diagram parts
   */
  useEffect(() => {
    mermaid.mermaidAPI.initialize({
      securityLevel: "loose",
      theme: interfaceStore.theme === Theme.Dark ? "dark" : "default"
    })

    setMermaidSyntax(value.concat(" "))
  }, [])

  return (
    <div className="MermaidOutput" onContextMenu={onContextMenu} style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      <div className="MermaidOutput-inner">
        <ZoomableContent
          initialState={initialState}
          onStageChange={onStateChange}
        >
          <div
            className="MermaidOutput-svg"
            ref={renderRef}
            dangerouslySetInnerHTML={{ __html: svgString }}
          >
          </div>
        </ZoomableContent>
      </div>
    </div>
  )
}
