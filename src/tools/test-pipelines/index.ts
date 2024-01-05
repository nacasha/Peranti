import { Tool } from "src/models/Tool"

const testPipelines = new Tool({
  toolId: "test-pipelines",
  name: "Test Pipelines",
  category: "Pipelines",
  inputs: [
    {
      key: "input",
      label: "Input",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
    }
  ],
  action: () => {},
  pipelines: [
    {
      toolId: "generate-uuid",
      fields: [
        {
          inputKey: "numberOfGenerated",
          previousOutputKey: "input"
        }
      ]
    },
    {
      toolId: "sort-list",
      fields: [
        {
          inputKey: "input",
          previousOutputKey: "output"
        }
      ]
    },
    {
      toolId: "text-transform",
      fields: [
        {
          inputKey: "input",
          previousOutputKey: "output"
        },
        {
          inputKey: "type",
          value: "uppercase"
        }
      ]
    }
  ]
})

export default testPipelines
