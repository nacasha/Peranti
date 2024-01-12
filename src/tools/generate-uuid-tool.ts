import { v1, v4 } from "uuid"

import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  numberOfGenerated: number
  type: string
  runner: unknown
}

interface OutputFields {
  output: unknown
}

const generateUuid: ToolConstructor<InputFields, OutputFields> = {
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
      component: "Button",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
    }
  ],
  action: ({ numberOfGenerated, type }) => {
    const uuidGenerator = { v1, v4 }[type]
    if (uuidGenerator === undefined) return { output: "" }

    const generatedUuids = []
    for (let i = 0; i < numberOfGenerated; i++) {
      generatedUuids.push(uuidGenerator())
    }
    const output = generatedUuids.join("\n")

    return { output }
  }
}

export default generateUuid
