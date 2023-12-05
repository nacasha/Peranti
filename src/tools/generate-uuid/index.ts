import { v1, v4 } from 'uuid';

import { Tool } from "../../types/Tool";

const generateUuid: Tool = {
  title: "Generate UUID",
  action: ({ numberOfGenerated, type }: { numberOfGenerated: number, type: string }) => {
    const uuidGenerator = { v1, v4 }[type]
    if (!uuidGenerator) return { output: "" }

    const generatedUuids = []
    for (let i = 0; i < numberOfGenerated; i++) {
      generatedUuids.push(uuidGenerator())
    }
    const uuidsLines = generatedUuids.join('\n')

    return { output: uuidsLines }
  },
  inputs: [
    {
      field: "type",
      component: "Select",
      defaultValue: "v4",
      props: {
        label: "UUID Version",
        options: [
          { value: "v1", label: "V1" },
          { value: "v4", label: "V4" },
        ]
      }
    },
    {
      field: "numberOfGenerated",
      component: "SingleTextInput",
      defaultValue: 1,
      props: {
        label: "Number of Generated UUID"
      }
    }
  ],
  outputs: [
    {
      field: "output",
      component: "SingleTextOutput",
    },
  ]
}

export default generateUuid
