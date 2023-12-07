import { Tool } from "src/models/Tool"

const testPipelines = new Tool({
  id: "test-pipelines",
  title: "Test Pipelines",
  category: "Pipelines",
  action: () => {
    return { }
  },
  inputs: [
    {
      key: "input",
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
