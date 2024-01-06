import { v1, v4 } from "uuid"

import { Tool } from "src/models/Tool"

const generateUuid = new Tool({
  toolId: "generate-uuid",
  name: "Generate UUID",
  category: "Generator",
  inputs: [
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
    }
  ],
  outputs: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
    }
  ],
  action: ({ numberOfGenerated, type }: { numberOfGenerated: number, type: string }) => {
    const uuidGenerator = { v1, v4 }[type]
    if (uuidGenerator === undefined) return { output: "" }

    const generatedUuids = []
    for (let i = 0; i < numberOfGenerated; i++) {
      generatedUuids.push(uuidGenerator())
    }
    const output = generatedUuids.join("\n")

    return { output }
  }
})

export default generateUuid
