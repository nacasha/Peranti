import { type FC } from "react"
import Markdown from "react-markdown"

import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./MarkdownOutput.scss"

interface MarkdownOutputProps extends OutputComponentProps {}

export const MarkdownOutput: FC<MarkdownOutputProps> = (props) => {
  const { value, label = "Output" } = props

  return (
    <div className="MarkdownOutput">
      <label className="InputOutputLabel">
        {label}
      </label>
      <div className="MarkdownOutput-inner">
        <div className="body">
          <Markdown>{value}</Markdown>
        </div>
      </div>
    </div>
  )
}
