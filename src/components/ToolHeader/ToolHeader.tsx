import { rootStore } from "../../store/root-store";
import { ToolRunButton } from "../ToolRunButton"

import "./ToolHeader.scss"

export const ToolHeader = () => {
  const { title } = rootStore.tool.use.currentToolOrEmpty()

  const onClickCopy = () => {
    const outputParams = rootStore.output.get.params()
    if (outputParams["output"]) {
      navigator.clipboard.writeText(outputParams["output"])
        .then(() => {
          console.log('Text successfully copied to clipboard');
        })
        .catch((err) => {
          console.error('Unable to copy text to clipboard', err);
        });
      }
  }

  return (
    <div className="ToolHeader">
      <div className="ToolHeader-title">
        {title}
      </div>
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
  );
}
