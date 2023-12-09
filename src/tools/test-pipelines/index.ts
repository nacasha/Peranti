import { Tool } from "src/models/Tool"

const testPipelines = new Tool({
  id: "test-pipelines",
  name: "Test Pipelines",
  category: "Pipelines",
  action: (input: any) => {
    try {
      const { action, ...inputParams } = input

      /* eslint-disable-next-line */
      const dynamicFunction = new Function("inputParams", action)
      const output = dynamicFunction(inputParams)

      return { output }
    } catch (e: unknown) {
      if (e instanceof Error) {
        return { output: e.message }
      }
      return { output: "Invalid" }
    }
  },
  inputs: [
    {
      key: "action",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "output",
      component: "Textarea"
    }
  ]
})

export default testPipelines
