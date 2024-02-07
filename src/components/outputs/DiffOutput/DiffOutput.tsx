import { observer } from "mobx-react"
import { type FC } from "react"
import ReactDiffViewer, { type DiffMethod } from "react-diff-viewer"

import { Theme } from "src/enums/theme"
import { interfaceStore } from "src/services/interface-store"
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
  const { label, value = { newCode: "", oldCode: "" }, compareMethod, leftTitle, rightTitle, splitView } = props

  return (
    <div className="DiffOutput">
      <label className="InputOutputLabel">{label}</label>
      <div className="DiffOutput-body">
        <ReactDiffViewer
          oldValue={value.oldCode}
          newValue={value.newCode}
          compareMethod={compareMethod}
          leftTitle={leftTitle}
          rightTitle={rightTitle}
          splitView={splitView}
          showDiffOnly={false}
          useDarkTheme={interfaceStore.theme === Theme.Dark}
        />
      </div>
    </div>
  )
})
