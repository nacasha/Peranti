import { v1, v4 } from "uuid"

import { Tool } from "src/models/Tool"

const generateUuid = new Tool({
  toolId: "generate-uuid",
  name: "Generate UUID",
  category: "Generator",
  action: ({ numberOfGenerated, type }: { numberOfGenerated: number, type: string }) => {
    const uuidGenerator = { v1, v4 }[type]
    if (uuidGenerator === undefined) return { output: "" }

    const generatedUuids = []
    for (let i = 0; i < numberOfGenerated; i++) {
      generatedUuids.push(uuidGenerator())
    }
    const uuidsLines = generatedUuids.join("\n")

    return { output: uuidsLines }
  },
  inputs: [
    {
      key: "type",
      component: "Select",
      defaultValue: "v4",
      props: {
        label: "UUID Version",
        options: [
          { value: "v1", label: "V1" },
          { value: "v4", label: "V4" }
        ]
      }
    },
    {
      key: "numberOfGenerated",
      component: "Text",
      defaultValue: 1,
      props: {
        label: "Number of Generated UUID"
      }
    }
  ],
  outputs: [
    {
      key: "output",
      component: "Textarea"
    }
  ]
})

export default generateUuid
