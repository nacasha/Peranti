import { type AppletConstructor } from "src/types/AppletConstructor"

const testPipelines: AppletConstructor = {
  appletId: "test-pipelines",
  name: "Test Pipelines",
  category: "Pipelines",
  inputFields: [
    {
      key: "input",
      label: "Input",
      component: "Code",
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
  ],
  action: () => undefined
}

export default testPipelines
