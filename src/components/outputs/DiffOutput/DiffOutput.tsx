import { observer } from "mobx-react"
import { type FC } from "react"
import ReactDiffViewer, { type DiffMethod } from "react-diff-viewer"

import { interfaceStore } from "src/stores/interfaceStore"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./DiffOutput.scss"

interface Output {
  oldCode: string
  newCode: string
}

interface DiffOutputProps extends OutputComponentProps<Output> {
  splitView?: boolean
  leftTitle?: string
  rightTitle?: string
  compareMethod?: DiffMethod
}

export const DiffOutput: FC<DiffOutputProps> = observer((props) => {
  const { label, output = { newCode: "", oldCode: "" }, compareMethod, leftTitle, rightTitle, splitView } = props

  return (
    <div className="DiffOutput">
      <label className="InputOutputLabel">{label}</label>
      <div className="DiffOutput-body">
        <ReactDiffViewer
          oldValue={output.oldCode}
          newValue={output.newCode}
          compareMethod={compareMethod}
          leftTitle={leftTitle}
          rightTitle={rightTitle}
          splitView={splitView}
          showDiffOnly={false}
          useDarkTheme={interfaceStore.isThemeDarkMode}
        />
      </div>
    </div>
  )
})
