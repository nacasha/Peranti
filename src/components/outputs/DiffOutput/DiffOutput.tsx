import { observer } from "mobx-react"
import { type FC } from "react"
import ReactDiffViewer, { type DiffMethod } from "react-diff-viewer"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { Theme } from "src/enums/theme-2"
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
  const { label, value = { newCode: "", oldCode: "" }, compareMethod, leftTitle, rightTitle, splitView, fieldKey } = props

  return (
    <div className="DiffOutput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
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
          styles={{
            variables: {
              dark: {
                diffViewerBackground: "#292a30",
                gutterBackground: "#292a30",
                gutterColor: "#838383"
              }
            }
          }}
        />
      </div>
    </div>
  )
})
