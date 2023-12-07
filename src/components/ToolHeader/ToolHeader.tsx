import { ToolRunButton } from "src/components/ToolRunButton"

import "./ToolHeader.scss"
import { toolStore } from "src/store/toolStore"
import { observer } from "mobx-react"

const ToolHeaderTitle = observer(() => (
  <div className="ToolHeader-title">
    {toolStore.getActiveToolTitle()}
  </div>
))

export const ToolHeader = () => {
  const onClickCopy = () => {
    const outputParams = "ok"

    if (outputParams) {
      navigator.clipboard.writeText(outputParams)
        .then(() => {
          console.log("Text successfully copied to clipboard")
        })
        .catch((err) => {
          console.error("Unable to copy text to clipboard", err)
        })
    }
  }

  return (
    <div className="ToolHeader">
      <ToolHeaderTitle />
      <div className="ToolHeader-button">
        <ToolRunButton />
        <div className="toolbar-button">
          <button>Sample</button>
        </div>
        <div className="toolbar-button">
          <button onClick={onClickCopy}>Copy Output</button>
        </div>
      </div>
    </div>
  )
}
