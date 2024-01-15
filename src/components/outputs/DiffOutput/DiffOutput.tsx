import { type FC } from "react"
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer"

import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./DiffOutput.scss"

interface Output {
  oldCode: string
  newCode: string
}

export const DiffOutput: FC<OutputComponentProps<Output>> = (props) => {
  const { label, output = { newCode: "", oldCode: "" } } = props

  return (
    <div className="DiffOutput">
      <label className="InputOutputLabel">{label}</label>
      <div className="DiffOutput-body">
        <ReactDiffViewer
          oldValue={output.oldCode}
          newValue={output.newCode}
          compareMethod={DiffMethod.CSS}
          splitView={true}
          showDiffOnly={false}
          useDarkTheme
        />
      </div>
    </div>
  )
}
