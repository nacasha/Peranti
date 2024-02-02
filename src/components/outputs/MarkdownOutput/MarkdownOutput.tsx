import { type FC } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./MarkdownOutput.scss"

interface MarkdownOutputProps extends OutputComponentProps {}

export const MarkdownOutput: FC<MarkdownOutputProps> = (props) => {
  const { value, label = "Output", onContextMenu } = props

  return (
    <div className="MarkdownOutput" onContextMenu={onContextMenu}>
      <label className="InputOutputLabel">
        {label}
      </label>
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
