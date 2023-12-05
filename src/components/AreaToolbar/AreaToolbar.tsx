import { rootStore } from "../../store/root-store";
import { Runner } from "../Runner"

export const AreaToolbar = () => {
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
    <div className="AppContentToolbar">
      <div className="AppContentToolbar-title">
        {title}
      </div>
      <div className="AppContentToolbar-button">
        <Runner />
        <div className="toolbar-button">
          <button>Clear</button>
        </div>
        <div className="toolbar-button">
          <button onClick={onClickCopy}>Copy Output</button>
        </div>
      </div>
    </div>
  );
}
