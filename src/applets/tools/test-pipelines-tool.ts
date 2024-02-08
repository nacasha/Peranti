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
      appletId: "generate-uuid",
      fields: [
        {
          inputKey: "numberOfGenerated",
          previousOutputKey: "input"
        }
      ]
    },
    {
      appletId: "sort-list",
      fields: [
        {
          inputKey: "input",
          previousOutputKey: "output"
        }
      ]
    },
    {
      appletId: "text-transform",
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
