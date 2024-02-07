import { DiffMethod } from "react-diff-viewer"

import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type AppletConstructor } from "src/types/AppletConstructor"

interface InputFields {
  inputA: InputFieldsType.Code
  inputB: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Diff
}

const jsonDiffTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "json-diff",
  name: "JSON Diff",
  category: "JSON",
  layoutSetting: {
    gridTemplate: "1fr 1.5fr"
  },
  inputFields: [
    {
      key: "inputA",
      label: "JSON A",
      component: "Code",
      defaultValue: "",
      props: {
        language: "json"
      }
    },
    {
      key: "inputB",
      label: "JSON B",
      component: "Code",
      defaultValue: "",
      props: {
        language: "json"
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
