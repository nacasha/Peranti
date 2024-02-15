import { v1, v4 } from "uuid"

import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  numberOfGenerated: InputFieldsType.Text
  type: InputFieldsType.Select
  runner: InputFieldsType.Run
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const generateUuidTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "generate-uuid",
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
  action: ({ inputValues, toast }) => {
    const { numberOfGenerated, type } = inputValues

    /**
     * Generate more than 10000 UUID(s) will decrease app performance
     * Show notification and return empty output
     */
    if (Number(numberOfGenerated) > 10000) {
      toast.error("Unable to generate more than 10000 UUID(s) at once", {
        id: "clipboard"
      })

      return { output: "" }
    }

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
