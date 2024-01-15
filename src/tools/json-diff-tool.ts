import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  inputA: string
  inputB: string
}

interface OutputFields {
  output: OutputFieldsType.Diff
}

const jsonDiffTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "json-diff",
  name: "JSON Diff",
  category: "JSON",
  layout: ToolLayoutEnum.SideBySide,
  inputFields: [
    {
      key: "inputA",
      label: "Input A",
      component: "Textarea",
      defaultValue: ""
    },
    {
      key: "inputB",
      label: "Input B",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Diff",
      component: "Diff"
    }
  ],
  action: (inputParams) => {
    const { inputA, inputB } = inputParams

    return {
      output: { newCode: inputA, oldCode: inputB }
    }
  }
}

export default jsonDiffTool
