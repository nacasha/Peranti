import { useEffect } from "react";
import { rootStore } from "../../store/root-store";

export const ToolRunButton = () => {
  const currentTool = rootStore.tool.use.currentToolOrEmpty()
  const inputParams = rootStore.input.use.params()

  const onRun = () => {
    const { action, inputs } = currentTool;
    const fieldsWithDefaultValue = Object.fromEntries(inputs.map((i) => [i.field, i.defaultValue]))

    const result: any = action({ ...fieldsWithDefaultValue, ...inputParams } as any)
    rootStore.output.set.params(result)
  }

  useEffect(() => {
    onRun()
  }, [inputParams]);

  return (
    <div className="toolbar-button">
      <button onClick={onRun}>Run</button>
    </div>
  )
}
