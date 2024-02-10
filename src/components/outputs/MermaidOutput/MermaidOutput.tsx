import mermaid from "mermaid"
import { type FC, useEffect, useState, useRef } from "react"

import { type OutputComponentProps } from "src/types/OutputComponentProps"

import { MermaidOutputZoomableSVG } from "./MermaidOutputZoomableSVG.js"

import "./MermaidOutput.scss"

interface MermaidOutputProps extends OutputComponentProps {}

export const MermaidOutput: FC<MermaidOutputProps> = (props) => {
  const { label, value = "", onContextMenu, onStateChange, initialState } = props

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
      // TODO console.log(exception)
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
    setMermaidSyntax(value.concat(" "))
  }, [])

  return (
    <div className="MermaidOutput" onContextMenu={onContextMenu}>
      <label className="InputOutputLabel">
        {label}
      </label>
      <div className="MermaidOutput-inner">
        <MermaidOutputZoomableSVG
          initialState={initialState}
          onStageChange={onStateChange}
        >
          <div
            className="MermaidOutput-svg"
            ref={renderRef}
            dangerouslySetInnerHTML={{ __html: svgString }}
          >
          </div>
        </MermaidOutputZoomableSVG>
      </div>
    </div>
  )
}
