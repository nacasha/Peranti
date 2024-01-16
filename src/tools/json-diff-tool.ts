import { DiffMethod } from "react-diff-viewer"

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
      label: "JSON A",
      component: "Textarea",
      defaultValue: ""
    },
    {
      key: "inputB",
      label: "JSON B",
      component: "Textarea",
      defaultValue: "",
      props: {

      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "JSON Diff",
      component: "Diff",
      props: {
        leftTitle: "JSON A",
        rightTitle: "JSON B",
        compareMethod: DiffMethod.CSS
      }
    }
  ],
  action: (inputParams) => {
    const { inputA, inputB } = inputParams

    return {
      output: { newCode: inputB, oldCode: inputA }
    }
  }
}

export default jsonDiffTool
