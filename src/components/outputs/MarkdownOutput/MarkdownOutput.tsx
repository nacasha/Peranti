import { type FC } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./MarkdownOutput.scss"

interface MarkdownOutputProps extends OutputComponentProps {}

export const MarkdownOutput: FC<MarkdownOutputProps> = (props) => {
  const { value, label = "Output", onContextMenu, fieldKey } = props

  return (
    <div className="MarkdownOutput" onContextMenu={onContextMenu} style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      <div className="MarkdownOutput-inner">
        <div className="body">
          <Markdown remarkPlugins={[remarkGfm]}>
            {value}
          </Markdown>
        </div>
      </div>
    </div>
  )
}
