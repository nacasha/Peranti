import { DiffMethod } from "react-diff-viewer"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  inputA: InputFieldsType.Code
  inputB: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Diff
}

const jsonDiffTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "json-diff",
  name: "JSON Diff",
  category: "JSON",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input output' 1fr / 1.5fr 2fr"
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
  action: ({ inputValues }) => {
    const { inputA, inputB } = inputValues

    return {
      output: { newCode: inputB, oldCode: inputA }
    }
  }
})

export default jsonDiffTool
