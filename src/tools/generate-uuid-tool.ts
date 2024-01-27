import { v1, v4 } from "uuid"

import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  numberOfGenerated: InputFieldsType.Text
  type: InputFieldsType.Select
  runner: InputFieldsType.Run
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const generateUuidTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "generate-uuid",
  name: "Generate UUID",
  category: "Generator",
  inputFields: [
    {
      key: "type",
      label: "UUID Version",
      component: "Select",
      defaultValue: "v4",
      props: {
        options: [
          { value: "v1", label: "V1" },
          { value: "v4", label: "V4" }
        ]
      }
    },
    {
      key: "numberOfGenerated",
      label: "Number of Generated UUID",
      component: "Text",
      defaultValue: 1
    },
    {
      key: "runner",
      label: "Regenerate",
      component: "Run",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Code"
    }
  ],
  action: ({ numberOfGenerated, type }) => {
    const uuidGenerator = { v1, v4 }[type]
    if (uuidGenerator === undefined) return { output: "" }

    const generatedUuids = []
    for (let i = 0; i < Number(numberOfGenerated); i++) {
      generatedUuids.push(uuidGenerator())
    }
    const output = generatedUuids.join("\n")

    return { output }
  }
}

export default generateUuidTool
